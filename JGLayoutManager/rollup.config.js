import babel from "rollup-plugin-babel";
import { terser } from 'rollup-plugin-terser';
export default {
    input: './src/index.js',
    output: {
        file: './dist/index.js',
        format: 'umd',
        sourcemap: false
    },
    plugins: [
        babel({
            runtimeHelpers: true
        }),
        /*terser({
            compress:{defaults:false,join_vars:false,drop_debugger:false}
        })*/
        terser()
    ]
};