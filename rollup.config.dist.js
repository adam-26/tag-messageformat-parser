import * as p from 'path';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const isProduction = process.env.NODE_ENV === 'production';

const copyright = `/*
 * Copyright ${new Date().getFullYear()}, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
`;

export default {
  input: p.resolve('src/parser.js'),
  output: {
    file: p.resolve(`dist/tag-messageformat-parser.${isProduction ? 'min.js' : 'js'}`),
    format: 'umd',
    name: 'TagMessageFormatParser',
    banner: copyright,
    exports: 'default',
    sourcemap: false,
  },
  external: [],
  plugins: [
//    babel(),
//     nodeResolve({
//       jsnext: true,
//     }),
//     commonjs({
//       sourcemap: true,
//     }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    isProduction &&
      uglify({
        warnings: false,
      }),
    filesize(),
  ].filter(Boolean),
};
