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
          "ld-test-assets"
          "test/sprites"
          "test/scss/sprites"
        ]

    spriteHD:
      options:
        destImg: "test/sprites"
        destCSS: "test/scss/sprites"
        imgUrl: "sprites"
      test:
        options:
          hd: true
        src: ["test/images/*"]
        spriteName: "test"

  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadTasks "tasks"

  grunt.registerTask "sprite", [
    "clean:test"
    "spriteHD:test"
  ]
  grunt.registerTask "style", [
    "sass:test"
  ]
