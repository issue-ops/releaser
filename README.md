# IssueOps Releaser

[![Check dist/](https://github.com/issue-ops/releaser/actions/workflows/check-dist.yml/badge.svg)](https://github.com/issue-ops/releaser/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/issue-ops/releaser/actions/workflows/codeql.yml/badge.svg)](https://github.com/issue-ops/releaser/actions/workflows/codeql.yml)
[![Continuous Integration](https://github.com/issue-ops/releaser/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/issue-ops/releaser/actions/workflows/continuous-integration.yml)
[![Continuous Deployment](https://github.com/issue-ops/releaser/actions/workflows/continuous-deployment.yml/badge.svg)](https://github.com/issue-ops/releaser/actions/workflows/continuous-deployment.yml)
[![Super Linter](https://github.com/issue-ops/releaser/actions/workflows/super-linter.yml/badge.svg)](https://github.com/issue-ops/releaser/actions/workflows/super-linter.yml)
[![Code Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Handle releases for GitHub repositories

## About

This action is designed to be used in conjunction with
[`issue-ops/semver`](https://github.com/issue-ops/semver) to automate release
creation based on version information contained in your repository.

When developing with
[GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow),
changes are submitted through a pull request (PR) and eventually merged into the
default branch (e.g. `main`). Using [Semantic Versioning](https://semver.org/),
merging breaking changes, new features, or bugfixes constitutes a version change
and, depending on your strategy, a new release. This action automates the
creation of releases based on provided version tags and/or "commitish" values
(commit SHAs and branch names).

## Setup

Here are several simple examples of how to use this action in your workflow.
Make sure to replace `vX.X.X` with the latest version of each action.

### Automatic Versioning

In this case, the version is parsed from the provided project manifest, and is
used to tag the release.

```yaml
name: Continuous Delivery

on:
  pull_request:
    types:
      - closed
    branches:
      - main

# This is required to be able to update tags and create releases
permissions:
  contents: write

jobs:
  release:
    name: Release Version
    runs-on: ubuntu-latest

    # Only run this job if the PR was merged
    if: ${{ github.event.pull_request.merged == true }}

    steps:
      # Checkout the repository with fetch-tags set to true
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4
        with:
          fetch-tags: true

      # Get the version and update the tags to use in the release
      - name: Tag Commit
        id: tag-commit
        uses: issue-ops/semver@vX.X.X
        with:
          manifest-path: package.json
          workspace: ${{ github.workspace }}
          ref: main

      # Use the version output from the previous step for the release
      # Prepend a 'v' to the beginning (e.g. 'v1.2.3')
      - name: Create Release
        id: create-release
        uses: issue-ops/releaser@vX.X.X
        with:
          tag: v${{ steps.tag-commit.outputs.version }}
```

### Manual Versioning

In this case, the version must be manually updated, such as from a GitHub
Actions variable.

```yaml
name: Continuous Delivery

on:
  pull_request:
    types:
      - closed
    branches:
      - main

# This is required to be able to update tags and create releases
permissions:
  contents: write

# This could also be a GitHub Actions variable
env:
  RELEASE_VERSION: v1.2.3

jobs:
  release:
    name: Release Version
    runs-on: ubuntu-latest

    # Only run this job if the PR was merged
    if: ${{ github.event.pull_request.merged == true }}

    steps:
      # Checkout the repository with fetch-tags set to true
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4
        with:
          fetch-tags: true

      # Use the version from the environment variable for the release
      - name: Create Release
        id: create-release
        uses: issue-ops/releaser@vX.X.X
        with:
          tag: ${{ env.RELEASE_VERSION }}
```

## Inputs

| Input                    | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `draft`                  | Whether or not the release should be a draft      |
|                          | Default: `false`                                  |
| `generate_release_notes` | Whether or not to generate release notes          |
|                          | Default: `true`                                   |
| `name`                   | The name of the release                           |
|                          | Default: The `tag` value                          |
| `notes`                  | The release notes, prepended to the generated     |
|                          | notes if `generate_release_notes` is `true`       |
| `owner`                  | The owner of the repository                       |
|                          | Default: The owner of the workflow repository     |
| `prerelease`             | Whether or not the release should be a prerelease |
|                          | Default: `false`                                  |
| `repo`                   | The repository to create the release in           |
|                          | Default: The workflow repository                  |
| `tag`                    | The tag to create or reference for the release    |
| `target_commitish`       | The branch or commit SHA to tag for the release   |
|                          | Not required if the tag already exists            |

## Outputs

| Output       | Description                             |
| ------------ | --------------------------------------- |
| `id`         | The release ID                          |
| `html_url`   | The URL to the release in the browser   |
| `upload_url` | The URL to upload assets to the release |
