module.exports = (grunt) ->

  # load all grunt tasks
  (require 'matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    clean: [
        'test/*.js'
        'benchmarks/*.js'
        'lib/parser.js'
        'test/fixtures/.tmp/**'
        '.tmp'
        'docs/**'
      ]

    peg:
      example:
        src: ['grammar/oli.peg', 'grammar/lexic.peg', 'grammar/*.peg']
        dest: 'lib/parser.js'

    livescript:
      options:
        bare: true
        prelude: false
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

    plato:
      sources:
        options:
          jshint: false
        files:
          'report/': ['lib/**/*.js', '!lib/parser.js']

    browserify:
      oli:
        options:
          standalone: 'oli'
        files:
          'oli.js': ['lib/oli.js']

    uglify:
      options:
        beautify:
          beautify: yes
          indent_level: 2
        mangle: no
        compress: no
        report: 'min'
        banner: '/*! oli.js - v<%= pkg.version %> - MIT License - https://github.com/oli-lang/oli-js ' +
          '| Generated <%= grunt.template.today("yyyy-mm-dd hh:MM") %> */\n'
      debug:
        files:
          'oli.js': ['oli.js']
      min:
        options:
          beautify: no
          mangle: yes
          compress: yes
          report: 'min'
        files:
          'oli.min.js': ['oli.js']

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

  grunt.registerTask 'build', [
    'test'
    'browserify'
    'uglify'
  ]

  grunt.registerTask 'bench', [
    'test'
    'benchmark'
  ]

  grunt.registerTask 'zen', [
    'test'
    'watch'
  ]

  grunt.registerTask 'publish', [
    'test'
    'clean'
    'build'
    'release'
  ]

  grunt.registerTask 'default', [
    'compile'
    'test'
  ]
