#!/usr/bin/env node

// Bad news: We have to write plain ES5 in this file

/* eslint-disable no-var */

var semver = require('semver');
var execa = require('execa');
var findVersions = require('find-versions');
var pkg = require('../package.json');

var MIN_GIT_VERSION = '2.7.1';

if (!semver.satisfies(process.version, pkg.engines.node)) {
  console.error(
    `[semantic-release-notes]: node version ${pkg.engines.node} is required. Found ${process.version}.

See https://github.com/semantic-release-notes/semantic-release-notes/blob/master/docs/support/node-version.md for more details and solutions.`
  );
  process.exit(1);
}

execa('git', ['--version'])
  .then(({ stdout }) => {
    var gitVersion = findVersions(stdout)[0];
    if (semver.lt(gitVersion, MIN_GIT_VERSION)) {
      console.error(`[semantic-release-notes]: Git version ${MIN_GIT_VERSION} is required. Found ${gitVersion}.`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(`[semantic-release-notes]: Git version ${MIN_GIT_VERSION} is required. No git binary found.`);
    console.error(error);
    process.exit(1);
  });

// Node 10+ from this point on
require('../cli')()
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
