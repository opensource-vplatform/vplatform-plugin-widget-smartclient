const babel = require("rollup-plugin-babel");
const terser = require('rollup-plugin-terser');
module.exports = {
    input: './src/JGQueryConditionPanel.js',
    output: {
        file: './dist/index.js',
        format: 'umd',
        sourcemap: false
    },
    plugins: [babel({
        runtimeHelpers: true
    }), terser.terser()]
};