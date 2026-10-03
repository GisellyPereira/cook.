module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testTimeout: 20000,
  moduleNameMapper: { '\\.(ttf|png)$': '<rootDir>/__tests__/assetMock.js' },
};
