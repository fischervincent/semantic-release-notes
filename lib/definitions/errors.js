const { inspect } = require('util');
const { toLower, isString } = require('lodash');
const pkg = require('../../package.json');

const [homepage] = pkg.homepage.split('#');
const stringify = (object) =>
  isString(object) ? object : inspect(object, { breakLength: Infinity, depth: 2, maxArrayLength: 5 });
const linkify = (file) => `${homepage}/blob/master/${file}`;

module.exports = {
  EPLUGINCONF: ({ type, required, pluginConf }) => ({
    message: `The \`${type}\` plugin configuration is invalid.`,
    details: `The [${type} plugin configuration](${linkify(`docs/usage/plugins.md#${toLower(type)}-plugin`)}) ${required ? 'is required and ' : ''
      } must be a single or an array of plugins definition. A plugin definition is an npm module name, optionally wrapped in an array with an object.

Your configuration for the \`${type}\` plugin is \`${stringify(pluginConf)}\`.`,
  }),
  EPLUGINSCONF: ({ plugin }) => ({
    message: 'The `plugins` configuration is invalid.',
    details: `The [plugins](${linkify(
      'docs/usage/configuration.md#plugins'
    )}) option must be an array of plugin definions. A plugin definition is an npm module name, optionally wrapped in an array with an object.

The invalid configuration is \`${stringify(plugin)}\`.`,
  }),
  EPLUGIN: ({ pluginName, type }) => ({
    message: `A plugin configured in the step ${type} is not a valid semantic-release-notes plugin.`,
    details: `A valid \`${type}\` **semantic-release-notes** plugin must be a function or an object with a function in the property \`${type}\`.

The plugin \`${pluginName}\` doesn't have the property \`${type}\` and cannot be used for the \`${type}\` step.

Please refer to the \`${pluginName}\` and [semantic-release-notes plugins configuration](${linkify(
      'docs/usage/plugins.md'
    )}) documentation for more details.`,
  }),
  ENOTAG: () => ({
    message: 'No tag found on local.',
    details: `You need to create a tag before running semantic-release-notes.`,
  }),
  ENONEWTAG: (tag) => ({
    message: `No new tag to release`,
    details: `The tag to release is the same as the last tag '${tag}'.`,
  }),
};
