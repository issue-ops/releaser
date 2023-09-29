import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import { Release } from './interfaces'

/**
 * The entrypoint for the action
 */
export async function run(): Promise<void> {
  // Get the inputs
  const draft: boolean = core.getInput('draft') === 'true'
  const generateReleaseNotes: boolean =
    core.getInput('generate_release_notes') === 'true'
  const name: string =
    core.getInput('name') ||
    core.getInput('tag', { required: true }).replace('refs/tags/', '')
  const notes: string = core.getInput('notes')
  const owner: string = core.getInput('owner', { required: true })
  const prerelease: boolean = core.getInput('prerelease') === 'true'
  const repo: string = core.getInput('repo', { required: true })
  const tag: string = core
    .getInput('tag', { required: true })
    .replace('refs/tags/', '')
  const target: string = core.getInput('target_commitish')
  const token: string = core.getInput('github_token', { required: true })

  // Log the inputs
  core.info('Running action with the following inputs:')
  core.info(`  draft: ${draft}`)
  core.info(`  generateReleaseNotes: ${generateReleaseNotes}`)
  core.info(`  name: ${name}`)
  core.info(`  notes: ${notes}`)
  core.info(`  owner: ${owner}`)
  core.info(`  prerelease: ${prerelease}`)
  core.info(`  repo: ${repo}`)
  core.info(`  tag: ${tag}`)
  core.info(`  target: ${target}`)

  // Create the Octokit client
  const github: Octokit = new Octokit({ auth: token })

  try {
    // Create the API options
    const options: any = {
      owner,
      repo,
      tag_name: tag,
      name,
      draft,
      prerelease,
      generate_release_notes: generateReleaseNotes
    }

    // Only add these options if they were provided
    if (target !== '') options.target_commitish = target
    if (notes !== '') options.body = notes

    // Create the release
    const response = await github.rest.repos.createRelease(options)

    core.debug(`Response: ${JSON.stringify(response, null, 2)}`)

    // Get the ID, html_url, and upload URL for the release
    const release: Release = {
      id: response.data.id,
      html_url: response.data.html_url,
      upload_url: response.data.upload_url
    }

    core.info(`Release: ${JSON.stringify(release, null, 2)}`)

    core.setOutput('id', release.id.toString())
    core.setOutput('html_url', release.html_url)
    core.setOutput('upload_url', release.upload_url)
  } catch (error: any) {
    core.setFailed(error.message)
    throw error
  }
}
