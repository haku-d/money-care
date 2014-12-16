module.exports = function(grunt) {

    // Load express server task
    grunt.loadNpmTasks('grunt-express-server');
    // Load grunt contrib watch task
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig ({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            express: {
                files:  [ '**/*.js' ],
                tasks:  [ 'express:dev' ],
                options: {
                    spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                }
            }
        },

        express: {
            options: {
                script: 'server.js',
                output: 'App is running'
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            },
            test: {
                options: {
                    node_env: 'testing'
                }
            }
        }
    });

    grunt.registerTask('default', ['express:dev']);
    grunt.registerTask('server', [ 'express:dev', 'watch' ])
}