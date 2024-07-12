import { jest } from '@jest/globals'

export const graphql = jest.fn()
export const paginate = jest.fn()
export const rest = {
  repos: {
    createRelease: jest.fn()
  }
}
