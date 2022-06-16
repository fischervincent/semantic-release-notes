const envCi = require('env-ci');

const getConfig = require('./lib/get-config');
const getCommits = require('./lib/get-commits');
const getReleaseToAdd = require('./lib/get-release-to-add');

module.exports = async (cliOptions = {}, { cwd = process.cwd(), env = process.env, stdout, stderr } = {}) => {
  const context = {
    cwd,
    env,
    stdout: stdout || process.stdout,
    stderr: stderr || process.stderr,
    envCi: envCi({ env, cwd }),
  };

  const { plugins, options } = await getConfig(context, cliOptions);

  context.options = options;

  const { lastRelease, nextRelease } = await getReleaseToAdd(context);

  const commits = await getCommits({ ...context, lastRelease, nextRelease });

  nextRelease.notes = await plugins.generateNotes({
    ...context,
    options,
    commits,
    lastRelease: currentRelease,
    nextRelease,
  });

  const result = await plugins.success({ ...context, lastRelease, commits, nextRelease, releases: [] });

  try {
    return result;
  } catch (error) {
    console.error(error);
    await callFail(context, plugins, error);
    throw error;
  }
};
