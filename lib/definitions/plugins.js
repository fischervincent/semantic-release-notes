/* eslint require-atomic-updates: off */

const { isString } = require('lodash');
const hideSensitive = require('../hide-sensitive');
const { hideSensitiveValues } = require('../utils');
const { RELEASE_NOTES_SEPARATOR } = require('./constants');

module.exports = {
  generateNotes: {
    required: false,
    dryRun: true,
    outputValidator: (output) => !output || isString(output),
    pipelineConfig: () => ({
      getNextInput: ({ nextRelease, ...context }, notes) => ({
        ...context,
        nextRelease: {
          ...nextRelease,
          notes: `${nextRelease.notes ? `${nextRelease.notes}${RELEASE_NOTES_SEPARATOR}` : ''}${notes}`,
        },
      }),
    }),
    postprocess: (results, { env }) => hideSensitive(env)(results.filter(Boolean).join(RELEASE_NOTES_SEPARATOR)),
  },
  success: {
    required: false,
    dryRun: false,
    pipelineConfig: () => ({ settleAll: true }),
    preprocess: ({ releases, env, ...inputs }) => ({ ...inputs, env, releases: hideSensitiveValues(env, releases) }),
  },
  fail: {
    required: false,
    dryRun: false,
    pipelineConfig: () => ({ settleAll: true }),
    preprocess: ({ errors, env, ...inputs }) => ({ ...inputs, env, errors: hideSensitiveValues(env, errors) }),
  },
};
