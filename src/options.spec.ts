import { expect } from 'chai';
import { Options } from './options';

describe('Options', () => {
  describe('Constructor', () => {
    it('should create rsd options instance with default values', () => {
      const options = new Options({});

      expect(options.command).to.be.equal('');
      expect(options.excludeDirs).to.be.deep.equal([]);
      expect(options.includeDirs).to.be.equal(undefined);
    });

    it('should concat command array into string', () => {
      const options = new Options({ _: [ 'foo', 'bar' ] });

      expect(options.command).to.be.equal('foo bar');
      expect(options.excludeDirs).to.be.deep.equal([]);
      expect(options.includeDirs).to.be.equal(undefined);
    });

    it('should save excludeDirs option', () => {
      const options = new Options({ excludeDirs: [ 'foo', 'bar' ] });

      expect(options.command).to.be.equal('');
      expect(options.excludeDirs).to.be.deep.equal([ 'foo', 'bar' ]);
      expect(options.includeDirs).to.be.deep.equal(undefined);
    });

    it('should save includeDirs option', () => {
      const options = new Options({ includeDirs: [ 'foo', 'bar' ] });

      expect(options.command).to.be.equal('');
      expect(options.excludeDirs).to.be.deep.equal([]);
      expect(options.includeDirs).to.be.deep.equal([ 'foo', 'bar' ]);
    });
  });
});