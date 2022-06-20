# semantic-release-notes

This package allows you to generate a release notes when you already have created the tag. For example you already created a new version that you tested in QA, maybe 2 because it needed a fix before deploying to prod, and you are going to push in PROD to deploy.
This package is like [**semantic-release**](https://github.com/semantic-release/semantic-release) but without the publishing, and it selects the last local tag as the next release, and the last remote tag as the last release.

## Install

Add the plugin to your npm-project:

```bash
$ npm install semantic-release-notes -D
```

## Configuration

This plugin has to be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration). Not every features of **semantic-release** are supported.
Example:

```json 
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-discord",
      {
        "notifyOnSuccess": true,
        "notifyOnFail": true,
        "discordWebhookId": "ID",
        "discordWebhookToken": "AAAA",
      }
    ]
  ]
}
```

### Options

| Option          | Description                                                                                                         | Default   |
| :-------------- | :------------------------------------------------------------------------------------------------------------------ | :-------- |
| `isAzureDevOps` | If true, rewrite the commits message so that it is correctly parsed by release-notes-generator.                     | false     |
| `azureWorkItem` | Path to azure work items. If defined and isAzureDevOps is true, it inserts the work item link to the commit message |           |