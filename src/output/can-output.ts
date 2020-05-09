import { WriteStream } from "tty";

export class canOutput {
  private output: WriteStream;

  constructor(output: WriteStream | void) {
    this.output = output || process.stdout;
  }

  protected write(txt: string) {
    this.output.write(txt);
  }

  protected writeln(txt: string = '') {
    this.write(txt + '\n');
  }
}
