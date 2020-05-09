export interface Runnable {
  isRunnable(): boolean;

  run(command: string | void): void;
}
