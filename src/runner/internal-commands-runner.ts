import { AbstractRunner } from './abstract-runner';
import { Cop } from '../cop/cop';
import { OptionSubType, OptionType } from '../cop/option';
import chalk from 'chalk';

export class InternalCommandsRunner extends AbstractRunner {
  isRunnable(): boolean {
    return !!this.options.command && this.options.command.substr(0, 1) === ':';
  }

  run() {
    const options = Cop.parse(this.options.command)
      .option('help', {
        flags      : [ ':help' ],
        description: 'Internal commands help',
      })
      .option('excludeDirs', {
        flags      : [ ':e', ':excludeDirs' ],
        type       : OptionType.array,
        subType    : OptionSubType.string,
        nArgs      : 1,
        description: 'Exclude directory',
        conflict   : [ 'includeDirs' ],
      })
      .option('includeDirs', {
        flags      : [ ':i', ':includeDirs' ],
        type       : OptionType.array,
        subType    : OptionSubType.string,
        nArgs      : 1,
        description: 'Include directory',
      })
      .getOptions()
    ;

    if (options.includeDirs) {
      this.options.includeDirs = options.includeDirs;
      this.options.excludeDirs = [];

      this.writeln(chalk.yellow('Set include dirs to ' + JSON.stringify(this.options.includeDirs)));
    } else if (options.excludeDirs) {
      this.options.excludeDirs = options.excludeDirs;
      this.options.includeDirs = [];

      this.writeln(chalk.yellow('Set exclude dirs to ' + JSON.stringify(this.options.excludeDirs)));
    }
  }
}
