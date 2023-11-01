/**
 * Unit tests for the action's main functionality, src/main.ts
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

// Mock the action's main function
let runMock: jest.SpyInstance

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}))

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

    runMock = jest.spyOn(main, 'run')
  })

  it('reads valid inputs', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'draft':
          return 'false'
        case 'generate_release_notes':
          return 'true'
        case 'name':
          return 'v1.0.0'
        case 'notes':
          return 'This is a test release'
        case 'owner':
          return 'issue-ops'
        case 'prerelease':
          return 'false'
        case 'repo':
          return 'releaser'
        case 'tag':
          return 'refs/tags/v1.0.0'
        case 'target_commitish':
          return 'main'
        default:
          return ''
      }
    })

    // Mock the Octokit client
    const mocktokit = {
      rest: {
        repos: {
          createRelease: () => {
            return {
              data: {
                id: 1,
                html_url: 'https://github.com/issue-ops/releaser/releases/1',
                upload_url:
                  'https://github.com/issue-ops/releaser/releases/1/assets'
              }
            }
          }
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(runMock).toHaveReturned()
    expect(getInputMock).toHaveBeenCalledWith('draft')
    expect(getInputMock).toHaveBeenCalledWith('generate_release_notes')
    expect(getInputMock).toHaveBeenCalledWith('name')
    expect(getInputMock).toHaveBeenCalledWith('notes')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('prerelease')
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('tag', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('target_commitish')
    expect(setOutputMock).toHaveBeenCalledWith('id', '1')
    expect(setOutputMock).toHaveBeenCalledWith(
      'html_url',
      'https://github.com/issue-ops/releaser/releases/1'
    )
    expect(setOutputMock).toHaveBeenCalledWith(
      'upload_url',
      'https://github.com/issue-ops/releaser/releases/1/assets'
    )
  })

  it('replaces name with tag when not present', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'draft':
          return 'false'
        case 'generate_release_notes':
          return 'true'
        case 'notes':
          return 'This is a test release'
        case 'owner':
          return 'issue-ops'
        case 'prerelease':
          return 'false'
        case 'repo':
          return 'releaser'
        case 'tag':
          return 'refs/tags/v1.0.0'
        case 'target_commitish':
          return 'main'
        default:
          return ''
      }
    })

    // Mock the Octokit client
    const mocktokit = {
      rest: {
        repos: {
          createRelease: jest.fn().mockImplementation(() => {
            return {
              data: {
                id: 1,
                html_url: 'https://github.com/issue-ops/releaser/releases/1',
                upload_url:
                  'https://github.com/issue-ops/releaser/releases/1/assets'
              }
            }
          })
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(runMock).toHaveReturned()
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

  it('sets empty strings to undefined', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'draft':
          return 'false'
        case 'generate_release_notes':
          return 'true'
        case 'owner':
          return 'issue-ops'
        case 'prerelease':
          return 'false'
        case 'repo':
          return 'releaser'
        case 'tag':
          return 'refs/tags/v1.0.0'
        default:
          return ''
      }
    })

    // Mock the Octokit client
    const mocktokit = {
      rest: {
        repos: {
          createRelease: jest.fn().mockImplementation(() => {
            return {
              data: {
                id: 1,
                html_url: 'https://github.com/issue-ops/releaser/releases/1',
                upload_url:
                  'https://github.com/issue-ops/releaser/releases/1/assets'
              }
            }
          })
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    await main.run()

    expect(runMock).toHaveReturned()
    expect(mocktokit.rest.repos.createRelease).toHaveBeenCalledWith({
      draft: false,
      generate_release_notes: true,
      name: 'v1.0.0',
      body: undefined,
      owner: 'issue-ops',
      prerelease: false,
      repo: 'releaser',
      tag_name: 'v1.0.0',
      target_commitish: undefined
    })
  })

  it('throws an error if there is an error creating the release', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'draft':
          return 'false'
        case 'generate_release_notes':
          return 'true'
        case 'name':
          return 'v1.0.0'
        case 'notes':
          return 'This is a test release'
        case 'owner':
          return 'issue-ops'
        case 'prerelease':
          return 'false'
        case 'repo':
          return 'releaser'
        case 'tag':
          return 'refs/tags/v1.0.0'
        case 'target_commitish':
          return 'main'
        default:
          return ''
      }
    })

    // Mock the Octokit client
    const mocktokit = {
      rest: {
        repos: {
          createRelease: () => {
            throw new Error('Error creating release')
          }
        }
      }
    }

    jest
      .spyOn(require('@octokit/rest'), 'Octokit')
      .mockImplementation(() => mocktokit)

    try {
      expect(await main.run()).toThrow('Error creating release')
    } catch (error) {
      expect(setFailedMock).toHaveBeenCalledWith('Error creating release')
    }
  })
})
