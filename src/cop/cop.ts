import { CopOption, Option, OptionType } from './option';
import { Configuration } from './configuration';

export class Cop {
  private options: { [name: string]: Option } = {};
  // private configuration: Configuration;

  constructor(private argv: string[]) {
    // this.configuration = {
    //   forceOptionAtStart: false
    // } as Configuration;
  }

  public static parse(args: string[] | string | undefined = undefined): Cop {
    let argv: string[] = [];

    if (args === null) {
      argv = [ ...process.argv.slice(2) ];
    } else if (typeof args === 'string') {
      argv = args.split(' ');
    } else if (args instanceof Array) {
      argv = [ ...args ];
    }

    return new Cop(argv);
  }

  // public config(configurations: Configuration) {
  //   this.configuration = Object.assign(
  //     this.configuration,
  //     configurations,
  //   );
  //
  //   return this;
  // }

  public getOptions() {
    const options: { [key: string]: any } = {};

    const argv = this.argv;

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      let optionFound = false;

      for (let [ name, option ] of Object.entries(this.options)) {
        if (option.flags.indexOf(arg) !== -1) {
          if (option.nArgs > 0) {
            let value = argv.slice(i + 1, i + 1 + option.nArgs);

            if (option.type === OptionType.array) {
              if (!options[name]) {
                options[name] = [];
              }

              options[name] = options[name].concat(value);
            } else if (option.type === OptionType.string) {
              options[name] = value;
            }

            i = i + option.nArgs;
          } else {
            options[name] = true;
          }

          optionFound = true;
        }
      }

      if (!optionFound) {
        options._ = argv.slice(i);

        break;
      }
    }

    for (let [ name, value ] of Object.entries(options)) {
      if (name === '_') {
        continue;
      }

      for (let conflict of this.options[name].conflict || []) {
        if (options[conflict]) {
          throw new Error(`You can't use ${name} and ${conflict} options together.`);
        }
      }
    }

    return options;
  }

  public option(name: string, option: CopOption): Cop {
    this.options[name] = Object.assign(
      // default values
      {
        type: OptionType.boolean,
        nArgs: 0
      },
      option
    ) as Option;

    return this;
  }
}
