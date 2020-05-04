export class Options {
  command: string;
  excludeDirs: string[];
  includeDirs: string[];

  constructor(options: { [key: string]: any; }) {
    this.command = options._ ? options._.join(' ') : '';
    this.excludeDirs = options.excludeDirs as string[] || [];
    this.includeDirs = options.includeDirs as string[];
  }
}
