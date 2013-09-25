module.exports = (grunt) ->

  # Configuration object
  grunt.initConfig

    pkg: grunt.file.readJSON "package.json"

    sass:
      test:
        files:
          "test/test-style.css": "test/scss/test-style.scss"

    clean:
      test:
        src: [
          "tempAssets"
          "ld-test-assets"
          "test/sprites"
          "test/scss/sprites"
        ]

    spriteHD:
      options:
        destImg: "test/sprites"
        destCSS: "test/scss/sprites"
        imgUrl: "sprites"
      test1:
        options:
          hd: true
        src: ["test/images/test-1/*"]
        spriteName: "test-1"

  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadTasks "tasks"

  grunt.registerTask "test", [
    "clean:test"
    "spriteHD"
  ]
  grunt.registerTask "style", [
    "sass:test"
  ]
  grunt.registerTask "sprite", [
    "test"
    "style"
  ]
