import { expect } from 'chai';
import { Rsd } from '../rsd';
import Sinon from 'sinon';
import { InternalCommandsRunner } from './internal-commands-runner';

describe('InternalCommandsRunner', () => {
  describe('isRunnable', () => {
    it('should return true when there is a valid internal command', () => {
      const runner = new InternalCommandsRunner(new Rsd([ ':foo' ]));

      expect(runner.isRunnable()).to.be.true;
    });

    it('should return false when there is no command', () => {
      const runner = new InternalCommandsRunner(new Rsd([]));

      expect(runner.isRunnable()).to.be.false;
    });

    it('should return false when there is no valid command', () => {
      const runner = new InternalCommandsRunner(new Rsd([ 'foo' ]));

      expect(runner.isRunnable()).to.be.false;
    });
  });

  describe('run', () => {
    const sandbox = Sinon.createSandbox();
    let stubWrite: Sinon.SinonStub;
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
      shell = process.env.SHELL;
      process.env.SHELL = 'env -i PS1=\$ /bin/bash --noprofile --norc';
      workingDirectory = process.cwd();
      process.chdir(workingDirectory + '/src');
    });

    afterEach(function () {
      sandbox.restore();
      process.env.SHELL = shell;
      process.chdir(workingDirectory);
      written = '';
    });

    it('should execute internal command includeDirs', async () => {
      const rsd = new Rsd([ ':i', 'foo' ]);
      const runner = new InternalCommandsRunner(rsd);

      await runner.run();
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[33mSet include dirs to [\"foo\"]\u001b[39m',
        ''
      ]);
      expect(rsd.options.excludeDirs).to.be.deep.equal([]);
      expect(rsd.options.includeDirs).to.be.deep.equal(['foo']);
    });

    it('should execute internal command excludeDirs', async () => {
      const rsd = new Rsd([ ':e', 'foo' ]);
      const runner = new InternalCommandsRunner(rsd);

      await runner.run();
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[33mSet exclude dirs to [\"foo\"]\u001b[39m',
        ''
      ]);
      expect(rsd.options.excludeDirs).to.be.deep.equal(['foo']);
      expect(rsd.options.includeDirs).to.be.deep.equal([]);
    });

    it('should not execute unknown command', async () => {
      const rsd = new Rsd([ ':foo' ]);
      const runner = new InternalCommandsRunner(rsd);

      await runner.run();
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[31mUnknown :foo command\u001b[39m',
        ''
      ]);
      expect(rsd.options.excludeDirs).to.be.deep.equal([]);
      expect(rsd.options.includeDirs).to.be.deep.equal(undefined);
    });

    it('should not change options if we execute an unknown command', async () => {
      const rsd = new Rsd([ ':i', 'foo' ]);
      const runner = new InternalCommandsRunner(rsd);

      await runner.run();
      const previousOptions = Object.assign({}, rsd.options);
      written = '';

      await runner.run(':foo');
      expect(written.split('\n')).to.be.deep.equal([
        '\u001b[31mUnknown :foo command\u001b[39m',
        ''
      ]);
      expect(rsd.options).to.be.deep.equal(previousOptions);
    });
  });
});