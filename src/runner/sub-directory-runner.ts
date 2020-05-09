import { lstatSync, readdirSync } from 'fs';
import chalk from 'chalk';
import { AbstractRunner } from './abstract-runner';
import { spawn } from 'node-pty';

interface PtyResponse {
  exitCode: number;
  lines: string[];
}

export class SubDirectoryRunner extends AbstractRunner {
  isRunnable(): boolean {
    return !!this.options.command && this.options.command.substr(0, 1) !== ':';
  }

  async run() {
    const includeDirs = this.options.includeDirs || readdirSync('./');

    const responses: { [key: string]: PtyResponse } = {};

    let chain = Promise.resolve();

    for (const dir of includeDirs) {
      if (dir.substr(0, 1) === '.'
        || !lstatSync('./' + dir).isDirectory()
        || this.options.excludeDirs.indexOf(dir) !== -1
      ) {
        continue;
      }

      const promise = new Promise<PtyResponse>((resolve) => {
        this.executeCommand(resolve, dir);
      });

      chain = chain.then(() => {
        return promise.then((response: PtyResponse) => {
          responses[dir] = response;
          this.displayOutput(response);
        })
      })
    }

    await chain.then(() => {
      this.displaySummary(responses);
    });
  }

  displaySummary(responses: { [key: string]: PtyResponse }) {
    const length = Object.keys(responses).length;
    const summaryTitle = `Executed in ${length} ${length > 1 ? 'directories' : 'directory'} :`;

    this.writeln();
    this.writeln(chalk.magenta('─'.repeat(summaryTitle.length)));
    this.writeln();

    this.writeln(
      chalk.bold.magentaBright(summaryTitle)
    );

    for (let [ dir, response ] of Object.entries(responses)) {
      this.writeln(
        '  ' +
        (
          response.exitCode === 0
            ? chalk.bold.green('\u2714')
            : chalk.bold.red('\u2715')
        ) +
        chalk.bold.magenta(' ' + dir)
      );
    }

    this.writeln('');
  }

  displayOutput(response: PtyResponse) {
    for (let line of response.lines) {
      this.writeln(line);
    }
  }

  executeCommand(resolve: (response: PtyResponse) => void, dir: string) {
    let output = '';

    const ptyProcess = spawn(
      process.env.SHELL || 'bash',
      [],
      {
        name: 'xterm-256color',
        cols: process.stdout.columns,
        rows: process.stdout.rows,
        cwd: dir,
        env: process.env as { [key: string]: string }
      }
    );

    ptyProcess.onData((data: string) => {
      output += data;
    });

    ptyProcess.onExit((e: { exitCode: number, signal?: number }) => {
      // clean start and end of output
      const lines = output.split('\n').slice(2, -3);

      resolve({
        exitCode: e.exitCode,
        lines
      });
    });

    ptyProcess.write(this.options.command + '\r');
    ptyProcess.write('exit $?\r');
  }
}
