const envCi = require('env-ci');
const hookStd = require('hook-std');

const getConfig = require('./lib/get-config');
const getCommits = require('./lib/get-commits');
const getReleaseToAdd = require('./lib/get-release-to-add');
const rewriteAzureCommit = require('./lib/rewrite-azure-commit');
const hideSensitive = require('./lib/hide-sensitive');

module.exports = async (cliOptions = {}, { cwd = process.cwd(), env = process.env, stdout, stderr } = {}) => {
  const { unhook } = hookStd(
    { silent: false, streams: [process.stdout, process.stderr, stdout, stderr].filter(Boolean) },
    hideSensitive(env)
  );
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

  let commits = await getCommits({ ...context, lastRelease, nextRelease });

  if (options.isAzureDevOps) {
    commits = commits.map(rewriteAzureCommit(options))
  }

  nextRelease.notes = await plugins.generateNotes({
    ...context,
    options,
    commits,
    lastRelease,
    nextRelease,
  });

  try {
    const result = await plugins.success({ ...context, lastRelease, commits, nextRelease, releases: [] });
    unhook();
    return result;
  } catch (error) {
    console.error(error);
    plugins.fail({ ...context, error })
    unhook();
    throw error;
  }
};
