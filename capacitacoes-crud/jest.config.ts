export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.jest.json' }],
  },
};
