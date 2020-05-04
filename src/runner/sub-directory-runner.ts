import { lstatSync, readdirSync } from 'fs';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { AbstractRunner } from './abstract-runner';

export class SubDirectoryRunner extends AbstractRunner {
  isRunnable(): boolean {
    return !!this.options.command && this.options.command.substr(0, 1) !== ':';
  }

  run() {
    let summary: { [key: string]: { success: boolean } } = {};

    const dirs = this.options.includeDirs || readdirSync('./');

    for (const dir of dirs) {
      if (dir.substr(0, 1) === '.'
        || !lstatSync('./' + dir).isDirectory()
        || this.options.excludeDirs.indexOf(dir) !== -1
      ) {
        continue;
      }

      this.writeln(chalk.bold.blue(dir));
      this.writeln('$ ' + this.options.command);
      try {
        execSync(this.options.command, { cwd: dir, stdio: 'inherit' });
        this.writeln(chalk.bold.green('\u2714 Done'));
        summary[dir] = { success: true };
      } catch (e) {
        this.writeln(chalk.bold.red('\u2715 Error'));
        summary[dir] = { success: false };
      }

      this.writeln('');
    }

    const length = Object.keys(summary).length;
    this.writeln(
      chalk.bold.magentaBright(
        `Executed in ${length} ${length > 1 ? 'directories' : 'directory'} :`
      )
    );
    for (let [ dir, data ] of Object.entries(summary)) {
      this.writeln(
        '  ' +
        (
          data['success']
            ? chalk.bold.green('\u2714')
            : chalk.bold.red('\u2715')
        ) +
        chalk.bold.magenta(' ' + dir),
      );
    }
    this.writeln('');
  }
}
