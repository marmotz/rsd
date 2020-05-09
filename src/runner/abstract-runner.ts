import { Runnable } from './runnable';
import { canOutput } from '../output/can-output';
import { Rsd } from '../rsd';
import { WriteStream } from 'tty';

export abstract class AbstractRunner extends canOutput implements Runnable {
  constructor(protected rsd: Rsd, output: WriteStream | void) {
    super(output);
  }

  get options() {
    return this.rsd.options;
  }

  abstract isRunnable(): boolean;

  abstract run(command: string | void): void;
}
