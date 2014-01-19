module.exports = (grunt) ->

  # load all grunt tasks
  (require 'matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean: ['dist', 'test/*.js', 'lib/parser.js', 'test/fixtures/.tmp/**']

    peg:
      example:
        src: 'grammar/oli.peg'
        dest: 'lib/parser.js'

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
      benchmarks:
        expand: true
        cwd: 'benchmarks'
        src: ['**/*.ls']
        dest: 'benchmarks'
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

    benchmark:
      all:
        options:
          displayResults: true
        src: [ 'benchmarks/*.js' ]

    browserify:
      dist:
        files:
          'dist/oli.js': ['lib/oli.js']

    watch:
      options:
        spawn: false
      lib:
        files: ['!lib/parser.js', 'lib/**/*.js', 'lib/*.peg']
        tasks: ['test']
      grammar:
        files: ['grammar/**/*.peg']
        tasks: ['test']
      src:
        files: ['src/**/*.ls']
        tasks: ['test']
      test:
        files: ['test/**/*.ls']
        tasks: ['test']


  grunt.registerTask 'compile', [
    'clean'
    'livescript'
    'peg'
  ]

  grunt.registerTask 'test', [
    'compile'
    'mochacli'
  ]

  grunt.registerTask 'bench', [
    'compile'
    'mochacli'
    'benchmark'
  ]

  grunt.registerTask 'zen', [
    'compile'
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
