// jest.config.js
export default {
    // Other configurations...
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {} // Disable default babel transform if it's interfering
};