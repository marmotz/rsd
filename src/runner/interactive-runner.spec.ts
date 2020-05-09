import { expect } from 'chai';
import { Rsd } from '../rsd';
import Sinon from 'sinon';
import { InteractiveRunner } from './interactive-runner';
import inquirer from 'inquirer';

describe('InteractiveRunner', () => {
  describe('isRunnable', () => {
    it('should return true when there is no command', () => {
      const runner = new InteractiveRunner(new Rsd([]));

      expect(runner.isRunnable()).to.be.true;
    });

    it('should return true when there is no command but option', () => {
      const runner = new InteractiveRunner(new Rsd([ '-i', 'foo' ]));

      expect(runner.isRunnable()).to.be.true;
    });

    it('should return false when there is command', () => {
      const runner = new InteractiveRunner(new Rsd(['foo']));

      expect(runner.isRunnable()).to.be.false;
    });
  });

  describe('run', () => {
    const sandbox = Sinon.createSandbox();
    let stubWrite: Sinon.SinonStub;
    let stubInquirer: Sinon.SinonStub;
    let shell: string | undefined;
    let workingDirectory: string;
    let written: string = '';

    beforeEach(function () {
      stubWrite = sandbox.stub(process.stdout, 'write');
      stubWrite.callsFake(
      (str: string | Uint8Array, encoding?: string | undefined, cb?: ((err?: Error | undefined) => void) | undefined): boolean => {
        written += str;

        return true;
      });
      stubInquirer = sandbox.stub(inquirer, 'prompt');
      shell = process.env.SHELL;
      process.env.SHELL = 'env -i PS1=\$ /bin/bash --noprofile --norc';
      workingDirectory = process.cwd();
      process.chdir(workingDirectory + '/fixtures');
    });

    afterEach(function () {
      sandbox.restore();
      process.env.SHELL = shell;
      process.chdir(workingDirectory);
      written = '';
    });

    it('should quit on empty command', async () => {
      stubInquirer.onFirstCall().returns(Promise.resolve({command: ''}));
      const runner = new InteractiveRunner(
        new Rsd([])
      );

      await runner.run();
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[32mType command or ENTER or CTRL-C to quit\u001b[39m',
        '',
        '',
      ]);
    });

    it('should execute typed command', async () => {
      stubInquirer.onFirstCall().returns(Promise.resolve({command: 'ls -1'}));
      stubInquirer.onSecondCall().returns(Promise.resolve({command: ''}));

      const runner = new InteractiveRunner(
        new Rsd([])
      );

      await runner.run();
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[32mType command or ENTER or CTRL-C to quit\u001b[39m',
        '',
        '$ls -1\r',
        'bar.txt\r',
        '',
        '$ls -1\r',
        'foo.txt\r',
        'foobar.txt\r',
        '',
        '',
        '\u001b[35m───────────────────────────\u001b[39m',
        '',
        '\u001b[1m\u001b[95mExecuted in 2 directories :\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[32m✔\u001b[39m\u001b[22m\u001b[1m\u001b[35m bar\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[32m✔\u001b[39m\u001b[22m\u001b[1m\u001b[35m foo\u001b[39m\u001b[22m',
        '',
        '\u001b[32mType command or ENTER or CTRL-C to quit\u001b[39m',
        '',
        '',
      ]);
    });
  });
});