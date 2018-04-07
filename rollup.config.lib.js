import * as p from 'path';
import filesize from 'rollup-plugin-filesize';

const copyright = `/*
 * Copyright ${new Date().getFullYear()}, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
`;

const libOptions = {
    banner: copyright,
    exports: 'default',
};

export default [{
    input: p.resolve('src/parser.js'),
    output: [{
        file: 'lib/index.js',
        format: 'cjs',
        ...libOptions,
    }, {
        file: 'lib/index.es.js',
        format: 'es',
        ...libOptions,
    }],
    plugins: [
        filesize()
    ],
}];
