export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.js?$': 'babel-jest',
  },
};
