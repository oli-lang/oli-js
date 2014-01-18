module.exports = (grunt) ->

  # load all grunt tasks
  (require 'matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean: ['dist', 'test/*.js', 'test/fixtures/.tmp/**']

    livescript:
      options:
        bare: true
        prelude: true
      src:
        expand: true
        cwd: 'src/'
        src: ['**/*.ls']
        dest: 'lib/'
        ext: '.js'
      test:
        expand: true
        cwd: 'test/lib'
        src: ['**/*.ls']
        dest: 'test/lib'
        ext: '.js'

    mochacli:
      options:
        require: ['chai']
        compilers: ['ls:LiveScript']
        timeout: 5000
        ignoreLeaks: false
        ui: 'bdd'
        reporter: 'spec'
      all:
        src: [
          'test/*.ls'
        ]

    browserify:
      dist:
        files:
          'dist/oli.js': ['lib/oli.js']

    watch:
      options:
        spawn: false
      lib:
        files: ['lib/**/*.js', 'lib/*.peg']
        tasks: ['test']
      grammar:
        files: ['grammar/**/*.peg']
      src:
        files: ['src/**/*.ls']
        tasks: ['test']
      test:
        files: ['test/**/*.ls']
        tasks: ['test']


  grunt.registerTask 'compile', [
    'clean'
    'livescript'
  ]

  grunt.registerTask 'test', [
    'compile',
    'mochacli'
  ]

  grunt.registerTask 'zen', [
    'compile',
    'mochacli'
    'watch'
  ]

  grunt.registerTask 'publish', [
    'test'
    'clean'
    'browserify'
    'release'
  ]

  grunt.registerTask 'default', [
    'compile'
    'test'
  ]
