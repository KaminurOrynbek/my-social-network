module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testTimeout: 30000,
  testMatch: [
    '**/src/__tests__/**/*.ts'      
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ]
};