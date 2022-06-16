const gitLogParser = require('git-log-parser');
const getStream = require('get-stream');

const execa = require('execa');

Object.assign(gitLogParser.fields, { hash: 'H', message: 'B', gitTags: 'd', committerDate: { key: 'ci', type: Date } });

async function getCommits(from, to, execaOptions) {
  return (
    await getStream.array(
      gitLogParser.parse(
        { _: `${from ? `${from}..` : ''}${to}` },
        { cwd: execaOptions.cwd, env: { ...process.env, ...execaOptions.env } }
      )
    )
  ).map(({ message, gitTags, ...commit }) => ({ ...commit, message: message.trim(), gitTags: gitTags.trim() }));
}

async function getLastRemoteTag(branch) {
  try {
    return (await execa('git', ['describe', `origin/${branch}`, '--abbrev=0', '--tags'])).stdout;
  } catch (e) {
    return null;
  }
}

async function getTagToRelease() {
  try {
    return (await execa('git', ['describe', '--abbrev=0', '--tags'])).stdout;
  } catch (e) {
    return null;
  }
}

async function getCurrentBranch() {
  return (await execa('git', ['branch', '--show-current'])).stdout;
}

module.exports = {
  getCommits,
  getCurrentBranch,
  getLastRemoteTag,
  getTagToRelease,
};
