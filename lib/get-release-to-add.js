const semverDiff = require('semver-diff');

const getError = require('./get-error');
const { getCurrentBranch, getLastRemoteTag, getTagToRelease } = require('./git');

module.exports = async () => {
  const currentBranch = await getCurrentBranch();
  const lastTag = await getLastRemoteTag(currentBranch);

  const tagToRelease = await getTagToRelease();
  if (!tagToRelease) throw new Error(getError('ENOTAG'));
  if (tagToRelease === lastTag) throw new Error(getError('ENONEWTAG', tagToRelease));

  const lastRemoteVersion = lastTag.replace(/^v/, '');
  const versionToRelease = tagToRelease.replace(/^v/, '');

  const type = lastTag ? semverDiff(lastTag, tagToRelease) : 'major';
  return {
    lastRelease: lastTag
      ? { type, version: lastRemoteVersion, channel: null, gitTag: lastTag, name: lastTag, gitHead: lastTag }
      : {},
    nextRelease: {
      type,
      version: versionToRelease,
      channel: null,
      gitTag: tagToRelease,
      name: tagToRelease,
      gitHead: tagToRelease,
    },
  };
};
