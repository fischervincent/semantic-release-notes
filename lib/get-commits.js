const { getCommits } = require('./git');

module.exports = async ({ cwd, env, lastRelease: { gitHead: from }, nextRelease: { gitHead: to = 'HEAD' } = {} }) => {
  const commits = await getCommits(from, to, { cwd, env });

  return commits;
};
