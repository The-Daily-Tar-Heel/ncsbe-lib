import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
    input: './index.ts',
    output: [
        {
            file: 'dist/bundle.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/bundle.esm.js',
            format: 'esm',
            sourcemap: true,
        }
    ],
    plugins: [
        resolve(),
        commonjs(),
        json(),
        typescript({
            tsconfig: './tsconfig.json',
        })
    ],
    external: ['tslib']
};