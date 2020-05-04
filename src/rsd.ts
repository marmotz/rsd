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

  constructor(argv: string[] | undefined) {
    super();

    const options = Cop.parse(argv)
      // .config({
      //   forceOptionAtStart: true,
      // })
      .option('excludeDirs', {
        flags      : [ '-e', '--exclude-dirs' ],
        type       : OptionType.array,
        subType    : OptionSubType.string,
        nArgs      : 1,
        description: 'Exclude directory',
        conflict   : [ 'includeDirs' ],
      })
      .option('includeDirs', {
        flags      : [ '-i', '--include-dirs' ],
        type       : OptionType.array,
        subType    : OptionSubType.string,
        nArgs      : 1,
        description: 'Include directory',
      })
      .getOptions()
    ;
    // console.log(options);
    // process.exit();

    // const options = yargs
    //   .version(pkg.version)
    //   .detectLocale(false)
    //   .command({
    //     command: 'titi',
    //     describe: 'Execute this command in all sub-directories.',
    //     handler: (argv) => {
    //       console.log('titi !!!!');
    //     }
    //   })
    //   .parserConfiguration({
    //     'halt-at-non-option': true,
    //   })
    // .option('exclude-dirs', {
    //   alias   : 'e',
    //   describe: 'exclude directory',
    //   type    : 'string',
    // })
    // .option('include-dirs', {
    //   alias   : 'i',
    //   describe: 'include directory',
    //   type    : 'string',
    // })
    // .conflicts('exclude-dirs', 'include-dirs')
    // .command('[command...]', 'Execute this command in all sub-directories.')
    //   .demandCommand()
    //   .help()
    //   // .parse(argv)
    //   .argv
    // ;

    // console.log(process.argv, options);
    // process.exit()
    //
    this.options = new Options(options);

    this.loadRunners();
  }

  getRunner(command: string | void): Runnable {
    if (command) {
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
      SubDirectoryRunner    : new SubDirectoryRunner(this),
      InteractiveRunner     : new InteractiveRunner(this),
      InternalCommandsRunner: new InternalCommandsRunner(this),
    };
  }

  async run() {
    await this.getRunner().run();
  }
}
