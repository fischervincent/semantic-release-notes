var urlJoin = require('url-join');

const rewriteMessage = (message) => message.replace(/Merged PR (\d{4}): /g, '').split('\n')[0];
const insertStory = (message, storyNumber, workItemLink) => `${message} ([#${storyNumber}](${urlJoin(workItemLink, storyNumber)}))`;
const getStoryNumber = (message) => message.match(/#(\d*)/) ? message.match(/#(\d*)/)[0].replace('#', '') : null;

const rewriteAzureCommit = (options) => ({ message, ...commit }) => {
  const workItemLink = options.azureWorkItem

  const storyNumber = getStoryNumber(message);
  const rewrittenMessage = rewriteMessage(message)
  const messageWithStoryNumber = storyNumber && workItemLink ? insertStory(rewrittenMessage, storyNumber, workItemLink) : rewrittenMessage;
  return {
    ...commit,
    message: messageWithStoryNumber
  }
}

module.exports = rewriteAzureCommit
