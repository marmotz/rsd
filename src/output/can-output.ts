import { Output } from './output';

export class canOutput {
  private output: Output;

  constructor(output: Output|null = null) {
    this.output = output || new Output();
  }

  write(txt: string) {
    this.output.write(txt);
  }

  writeln(txt: string) {
    this.write(txt + '\n');
  }
}
