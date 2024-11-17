const path = require('path');

module.exports = function override(config, env) {
    // Add fallback for node modules
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "path": false,
        "fs": false,
        "util": false
    };

    // Ignore node modules in better-sqlite3
    config.externals = {
        ...config.externals,
        'better-sqlite3': 'commonjs better-sqlite3'
    };

    return config;
};
