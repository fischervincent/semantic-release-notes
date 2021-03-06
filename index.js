const envCi = require('env-ci');

const getConfig = require('./lib/get-config');
const getCommits = require('./lib/get-commits');
const getReleaseToAdd = require('./lib/get-release-to-add');
const rewriteAzureCommit = require('./lib/rewrite-azure-commit');

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

  const result = await plugins.success({ ...context, lastRelease, commits, nextRelease, releases: [] });

  try {
    return result;
  } catch (error) {
    console.error(error);
    await callFail(context, plugins, error);
    throw error;
  }
};
