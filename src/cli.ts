import { Rsd } from './rsd';
import chalk from 'chalk';

(async () => {
  try {
    const rsd = new Rsd(
      process.argv.slice(2)
    );

    await rsd.run();
  } catch (e) {
    console.log(chalk.bold.red('Fatal error: ' + e.toString()));
    console.log(e);
  } finally {
    console.log(chalk.bold.magenta('Bye.'));
    process.exit();
  }
})();
