export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['json-summary', 'text', 'lcov'],
    projects: [
        {
            displayName: 'unit',
            testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup-mock.ts'],
            transform: { '^.+\\.ts$': 'ts-jest' },
        },
        {
            displayName: 'integration',
            testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
            setupFilesAfterEnv: ['<rootDir>/tests/setup-real.ts'],
            transform: { '^.+\\.ts$': 'ts-jest' },
        },
    ],
};
