import { lstatSync, readdirSync } from 'fs';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import { AbstractRunner } from './abstract-runner';
import { format } from 'date-fns';
import execa from 'execa';

export class SubDirectoryRunner extends AbstractRunner {
  isRunnable(): boolean {
    return !!this.options.command && this.options.command.substr(0, 1) !== ':';
  }

  async run() {
    let statuses: { [key: string]: boolean } = {};

    const dirs = this.options.includeDirs || readdirSync('./');

    const promises = [];

    for (const dir of dirs) {
      if (dir.substr(0, 1) === '.'
        || !lstatSync('./' + dir).isDirectory()
        || this.options.excludeDirs.indexOf(dir) !== -1
      ) {
        continue;
      }

      promises.push(
        new Promise((resolve, reject) => {
          const args = this.options.command.split(' ');
          const command = spawn(
            args[0],
            args.slice(1),
            {
              shell: process.env.SHELL,
              cwd: dir,
              env: {
                ...process.env,
                // @ts-ignore
                FORCE_COLOR: true
              }
            }
          );

          const output: string[] = [];

          const saveOutput = (data: string) => {
            output.push(data);
          }

          process.stdout.on('data', saveOutput);
          process.stdout.on('error', saveOutput);
          if (command.stdout) {
            command.stdout.on('data', saveOutput);
            command.stdout.on('error', saveOutput);
          }
          if (command.stderr) {
            command.stderr.on('data', saveOutput);
            command.stderr.on('error', saveOutput);
          }
          command.on('close', (code: number) => {
            this.writeln(chalk.bold.blue(dir));
            this.writeln('$ ' + this.options.command);
            this.writeln(output.join(''));
            if (code === 0) {
              this.writeln(chalk.bold.green('\u2714 Done'));
              statuses[dir] = true;

              resolve();
            } else {
              this.writeln(chalk.bold.red('\u2715 Error'));
              statuses[dir] = false;

              reject();
            }
          });
        })
      );
    }

    await Promise.all(promises);
    this.writeln();

    const length = Object.keys(statuses).length;
    this.writeln(
      chalk.bold.magentaBright(
        `Executed in ${length} ${length > 1 ? 'directories' : 'directory'} :`
      )
    );
    for (let [ dir, status ] of Object.entries(statuses)) {
      this.writeln(
        '  ' +
        (
          status
            ? chalk.bold.green('\u2714')
            : chalk.bold.red('\u2715')
        ) +
        chalk.bold.magenta(' ' + dir),
      );
    }
    this.writeln('');
  }
}
