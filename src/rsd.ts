import { Options } from './options';
import { SubDirectoryRunner } from './runner/sub-directory-runner';
import { Runnable } from './runner/runnable';
import { canOutput } from './output/can-output';
import { InteractiveRunner } from './runner/interactive-runner';
import { InternalCommandsRunner } from './runner/internal-commands-runner';
import { Cop } from './cop/cop';
import { OptionSubType, OptionType } from './cop/option';

export class Rsd extends canOutput {
  options: Options;
  private runners: { [key: string]: Runnable } = {};

  constructor(argv: string[] | void) {
    super();

    const options = new Cop()
      .option('excludeDirs', {
        flags: [ '-e', '--exclude-dirs' ],
        type: OptionType.array,
        subType: OptionSubType.string,
        nArgs: 1,
        description: 'Exclude directory',
        conflict: [ 'includeDirs' ]
      })
      .option('includeDirs', {
        flags: [ '-i', '--include-dirs' ],
        type: OptionType.array,
        subType: OptionSubType.string,
        nArgs: 1,
        description: 'Include directory'
      })
      .parse(argv)
    ;

    this.options = new Options(options);

    this.loadRunners();
  }

  getRunner(command: string | void): Runnable {
    if (command !== undefined) {
      this.options.command = command;
    }

    for (let runner of Object.values(this.runners)) {
      if (runner.isRunnable()) {
        return runner;
      }
    }

    throw new Error('no runner found is this particular case');
  }

  loadRunners() {
    this.runners = {
      SubDirectoryRunner: new SubDirectoryRunner(this),
      InteractiveRunner: new InteractiveRunner(this),
      InternalCommandsRunner: new InternalCommandsRunner(this)
    };
  }

  async run() {
    await this.getRunner().run();
  }
}
