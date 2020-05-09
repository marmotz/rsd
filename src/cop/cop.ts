import { CopOption, Option, OptionType } from './option';

// Cli Option Parser
export class Cop {
  private _argv: string[] = [];
  private _options: { [name: string]: Option } = {};
  private _parsed: { [name: string]: any } = {};

  constructor() {
  }

  get options(): { [name: string]: Option } {
    return this._options;
  }

  get argv(): string[] {
    return this._argv;
  }

  option(name: string, option: CopOption): Cop {
    this._options[name] = {
      // default values
      type: OptionType.boolean,
      nArgs: 0,
      ...option
    } as Option;

    return this;
  }

  parse(args: string[] | string | void): { [name: string]: any } {
    if (args === undefined) {
      this._argv = [ ...process.argv.slice(2) ];
    } else if (typeof args === 'string') {
      this._argv = args.split(' ');
    } else {
      this._argv = [ ...args ];
    }

    this._parsed = {};

    for (let i = 0; i < this._argv.length; i++) {
      const result = this.parseArg(i);

      if (result === false) {
        this._parsed._ = this._argv.slice(i);

        break;
      } else {
        i = result;
      }
    }

    this.checkConflict();

    return this._parsed;
  }

  private checkConflict() {
    for (let name of Object.keys(this._parsed)) {
      if (name === '_') {
        continue;
      }

      for (let conflict of this._options[name].conflict || []) {
        if (this._parsed[conflict]) {
          throw new Error(`You can't use ${name} and ${conflict} options together.`);
        }
      }
    }
  }

  private parseArg(argIndex: number): number | false {
    let optionFound = false;
    const arg = this._argv[argIndex];

    for (let [ name, option ] of Object.entries(this._options)) {
      if (option.flags.indexOf(arg) !== -1) {
        if (option.nArgs > 0) {
          let value = this._argv.slice(argIndex + 1, argIndex + 1 + option.nArgs);

          if (option.type === OptionType.array) {
            if (!this._parsed[name]) {
              this._parsed[name] = [];
            }

            this._parsed[name] = this._parsed[name].concat(value);
          } else if (option.type === OptionType.string) {
            this._parsed[name] = value.join(' ');
          }

          argIndex = argIndex + option.nArgs;
        } else {
          this._parsed[name] = true;
        }

        optionFound = true;
      }
    }

    return optionFound ? argIndex : false;
  }
}
