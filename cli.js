const { argv, env, stderr } = require('process');
const util = require('util');
const hideSensitive = require('./lib/hide-sensitive');

module.exports = async () => {
  const cli = require('yargs')
    .command('$0', 'Run release notes generation', (yargs) => {
      yargs.demandCommand(0, 0).usage(`Run release notes generation

Usage:
  semantic-release-notes [options] [plugins]`);
    })
    .option('last-tag', { describe: 'Git last tag', type: 'string', group: 'Options' })
    .option('next-tag', { describe: 'Git tag to release', type: 'string', group: 'Options' })
    .strict(false)
    .exitProcess(false);

  try {
    const { help, version, ...options } = cli.parse(argv.slice(2));

    if (Boolean(help) || Boolean(version)) {
      return 0;
    }

    await require('.')(options);
    return 0;
  } catch (error) {
    if (error.name !== 'YError') {
      stderr.write(hideSensitive(env)(util.inspect(error, { colors: true })));
    }

    return 1;
  }
};
