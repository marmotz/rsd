import { AbstractRunner } from './abstract-runner';
import inquirer from 'inquirer';
import chalk from 'chalk';

export class InteractiveRunner extends AbstractRunner {
  isRunnable(): boolean {
    return !this.options.command;
  }

  async promptCommand(): Promise<string> {
    this.writeln(chalk.green('Type command or ENTER or CTRL-C to quit'));
    const response = await inquirer.prompt([{
      name: 'command',
      prefix: '',
      message: chalk.yellow('$')
    }]);

    return response.command;
  }

  async run() {
    let command: string;

    do {
      command = await this.promptCommand();
      this.writeln('');

      if (command) {
        await this.rsd.getRunner(command).run();
      }
    } while(command);
  }
}
