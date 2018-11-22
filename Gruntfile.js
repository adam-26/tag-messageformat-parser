'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            dist: 'dist/',
            lib : 'lib/'
        },

        benchmark: {
            all: {
                src: ['test/benchmark/*.js']
            }
        },

        peg: {
            parser: {
                src : 'src/parser.pegjs',
                dest: 'src/parser.js',

                options: {
                    wrapper: function (filename, code) {
                        return 'export default ' + code + ';';
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-benchmark');
    grunt.loadNpmTasks('grunt-peg');

    grunt.registerTask('default', [
        'clean', 'peg'
    ]);
};
