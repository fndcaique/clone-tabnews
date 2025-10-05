/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
