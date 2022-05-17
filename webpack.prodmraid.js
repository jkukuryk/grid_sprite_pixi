const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const inline = require('./webpack.inline.js');

module.exports = merge(common, inline, {
    mode: 'production',
});
