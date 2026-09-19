const globals = require('globals');

module.exports = [
    {
        files: ['src/**/*.js', 'tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'eqeqeq': 'error',
        },
    },
];