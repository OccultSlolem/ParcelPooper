export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest', 
      { useESM: true }
    ] 
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
};
