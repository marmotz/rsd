import { Runnable } from './runnable';
import { canOutput } from '../output/can-output';
import { Rsd } from '../rsd';

export abstract class AbstractRunner extends canOutput implements Runnable{
  constructor(protected rsd: Rsd) {
    super();
  }

  get options() {
    return this.rsd.options;
  }

  abstract isRunnable(): boolean;

  abstract run(): void;
}
