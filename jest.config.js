module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|svg|ico|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/src/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js',
      },
      testMatch: ['<rootDir>/src/**/*.test.js'],
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      // Если у вас отдельные файлы для e2e-тестов, например, в папке /e2e
      testMatch: ['<rootDir>/e2e/**/*.test.js'],
    },
  ],
};
