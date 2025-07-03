import { jest } from '@jest/globals'
import { RestEndpointMethodTypes } from '@octokit/rest'
import * as core from '../__fixtures__/core.js'
import * as octokit from '../__fixtures__/octokit.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@octokit/rest', async () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})

const main = await import('../src/main.js')
const { Octokit } = await import('@octokit/rest')

const mocktokit = jest.mocked(new Octokit())

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput
      .mockReturnValueOnce('https://api.github.com') // api_url
      .mockReturnValueOnce('false') // draft
      .mockReturnValueOnce('true') // generate_release_notes
      .mockReturnValueOnce('v1.0.0') // name
      .mockReturnValueOnce('This is a test release') // notes
      .mockReturnValueOnce('issue-ops') // owner
      .mockReturnValueOnce('false') // prerelease
      .mockReturnValueOnce('releaser') // repo
      .mockReturnValueOnce('refs/tags/v1.0.0') // tag
      .mockReturnValueOnce('main') // target_commitish
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Reads valid inputs', async () => {
    // Mock the Octokit client
    mocktokit.rest.repos.createRelease.mockResolvedValue({
      data: {
        id: 1,
        html_url: 'https://github.com/issue-ops/releaser/releases/1',
        upload_url: 'https://github.com/issue-ops/releaser/releases/1/assets'
      }
    } as RestEndpointMethodTypes['repos']['createRelease']['response'])

    await main.run()

    expect(core.getInput).toHaveBeenCalledWith('api_url', { required: true })
    expect(core.getInput).toHaveBeenCalledWith('draft')
    expect(core.getInput).toHaveBeenCalledWith('generate_release_notes')
    expect(core.getInput).toHaveBeenCalledWith('name')
    expect(core.getInput).toHaveBeenCalledWith('notes')
    expect(core.getInput).toHaveBeenCalledWith('owner', { required: true })
    expect(core.getInput).toHaveBeenCalledWith('prerelease')
    expect(core.getInput).toHaveBeenCalledWith('repo', { required: true })
    expect(core.getInput).toHaveBeenCalledWith('tag', { required: true })
    expect(core.getInput).toHaveBeenCalledWith('target_commitish')
    expect(core.setOutput).toHaveBeenCalledWith('id', '1')
    expect(core.setOutput).toHaveBeenCalledWith(
      'html_url',
      'https://github.com/issue-ops/releaser/releases/1'
    )
    expect(core.setOutput).toHaveBeenCalledWith(
      'upload_url',
      'https://github.com/issue-ops/releaser/releases/1/assets'
    )
  })

  it('Replaces name with tag when not present', async () => {
    core.getInput
      .mockClear()
      .mockReturnValueOnce('https://api.gihub.com') // api_url
      .mockReturnValueOnce('false') // draft
      .mockReturnValueOnce('true') // generate_release_notes
      .mockReturnValueOnce('') // name
      .mockReturnValueOnce('This is a test release') // notes
      .mockReturnValueOnce('issue-ops') // owner
      .mockReturnValueOnce('false') // prerelease
      .mockReturnValueOnce('releaser') // repo
      .mockReturnValueOnce('refs/tags/v1.0.0') // tag
      .mockReturnValueOnce('main') // target_commitish

    mocktokit.rest.repos.createRelease.mockResolvedValue({
      data: {
        id: 1,
        html_url: 'https://github.com/issue-ops/releaser/releases/1',
        upload_url: 'https://github.com/issue-ops/releaser/releases/1/assets'
      }
    } as RestEndpointMethodTypes['repos']['createRelease']['response'])

    await main.run()

    expect(mocktokit.rest.repos.createRelease).toHaveBeenCalledWith({
      draft: false,
      generate_release_notes: true,
      name: 'v1.0.0',
      body: 'This is a test release',
      owner: 'issue-ops',
      prerelease: false,
      repo: 'releaser',
      tag_name: 'v1.0.0',
      target_commitish: 'main'
    })
  })

  it('Throws an error if there is an error creating the release', async () => {
    mocktokit.rest.repos.createRelease.mockRejectedValue(
      new Error('Error creating release')
    )

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith('Error creating release')
  })
})
