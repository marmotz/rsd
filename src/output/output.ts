import { WriteStream } from "tty";

export class Output {
  private output: WriteStream;

  constructor(output: WriteStream|null = null) {
    this.output = output || process.stdout;
  }

  write(txt: string) {
    this.output.write(txt);
  }

  writeln(txt: string) {
    this.write(txt + '\n');
  }
}
