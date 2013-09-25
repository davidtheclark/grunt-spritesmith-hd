// Node modules.
var gm = require("gm"),
    grunt = require("grunt"),
    path = require("path"),
    gruntSpritesmith = require("grunt-spritesmith");

module.exports = function(grunt) {

  // The function that constitutes the Grunt task.
  var spriteHD = function() {

    // Settings.
    var data         = this.data,
        options      = this.options(),
        src          = data.src, // required
        spriteName   = data.spriteName, // required

        // For grunt-spritesmith
        destImg      = options.destImg      || 'images/sprites',
        destCSS      = options.destCSS      || 'style/scss/sprites',
        imgUrl       = options.imgUrl       || path.relative(destCSS, destImg),
        imgPath      = options.imgUrl       || false,
        algorithm    = options.algorithm    || "binary-tree",
        padding      = options.padding      || 1,
        engine       = options.engine       || "gm",
        engineOpts   = options.engineOpts   || {},
        imageOpts    = options.imageOpts    || {},
        cssOpts      = options.cssOpts      || {},

        // Other
        assetFormats = options.assetFormats || ['.png', '.jpg', '.jpeg'],
        hd           = options.hd           || false,
        hdPrefix     = options.hdPrefix     || 'hd',
        ldPrefix     = options.ldPrefix     || 'ld',
        imageType    = options.imageType    || 'png';

    // Derivations from the settings.
    var srcFiles     = grunt.file.expand(src),
        hdImageName  = hdPrefix + "-" + spriteName + "." + imageType,
        hdImagePath  = path.join(destImg, hdImageName),
        hdImageUrl   = path.join(imgUrl, hdImageName),
        ldImageName  = ldPrefix + "-" + spriteName + "." + imageType,
        ldImagePath  = path.join(destImg, ldImageName),
        ldImageUrl   = path.join(imgUrl, ldImageName),
        hdStyleName  = "_sprite-" + spriteName + "-hd.scss",
        hdStylePath  = path.join(destCSS, hdStyleName),
        ldStyleName  = "_sprite-" + spriteName + ".scss",
        ldStylePath  = path.join(destCSS, ldStyleName),
        hdAssetDir   = hdPrefix + "-" + spriteName + "-assets",
        ldAssetDir   = ldPrefix + "-" + spriteName + "-assets",
        spritesmithParams = {
          'algorithm': algorithm,
          'engine': engine,
          'engineOpts': engineOpts,
          'imageOpts': imageOpts
        };


    /*============================
    Create full-size assets for HD spritesheet
    ==============================*/

    grunt.log.writeln('Creating temporary ' + hdPrefix + ' assets ...');
    grunt.util._.forEach(srcFiles, function (file) {
      var newName = 'hd-' + path.basename(file);
      grunt.file.copy(file, path.join(hdAssetDir, newName));
    });


    /*============================
    Create resized assets for LD spritesheet
    ==============================*/

    grunt.log.writeln("Creating temporary " + ldPrefix + " assets ...");

    // create the LD asset directory
    if (!grunt.file.exists(ldAssetDir)) {
      grunt.file.mkdir(ldAssetDir);
    } else {
      grunt.log.error("An existing directory is getting in the way of spritesmithHD creating a temporary LD asset directory at '" + ldAssetDir + "'.");
    }

    var resizedImages = [];
    var loopOngoing = function (err) {
      if (err) {
        grunt.log.error(err);
      }
    };
    var loopDone = function (err) {
      // When the loop is done, the resized images to the function that runs spritesmith.
      if (err) {
        grunt.log.error(err);
      } else {
        runLdSpritesmith();
      }
    };

    // The loop.
    for (var i = 0, len = srcFiles.length; i < len; i++) {
      /*
      For each file:
      - add its name to resizedImages array;
      - create a 50%-sized duplicate in ldAssetsDir;
      - check for errors;
      - if it's the last one, run spritesmith.
      */
      var file = srcFiles[i],
          ext = path.extname(file);
      if (grunt.util._.contains(assetFormats, ext)) {
        var filename = path.basename(file),
            pathToTarget = path.join(ldAssetDir, filename),
            callback = (i === len - 1) ? loopDone : loopOngoing;
        resizedImages.push(pathToTarget);
        gm(file).resize(50, 50, "%")
          .write(pathToTarget, callback);
      }
    }

    /*============================
    PREP HD SETTINGS
    ==============================*/

    var hdSpritesmithParams = {
      'hd': {
        'src': [hdAssetDir + '/*'],
        'destImg': hdImagePath,
        'destCSS': hdStylePath,
        'imgPath': hdImageUrl,
        'padding': padding * 2,
        'cssOpts': {
          'functions': false
        }
      }
    };
    grunt.util._.extend(hdSpritesmithParams.hd, spritesmithParams);

    /*============================
    LD SPRITESMITH
    ==============================*/

    var ldSpritesmithParams = {
      'ld': {
        'src': [ldAssetDir + '/*'],
        'destImg': ldImagePath,
        'destCSS': ldStylePath,
        'imgPath': ldImageUrl,
        'padding': padding,
        'cssOpts': cssOpts,
        'cssTemplate': path.join(__dirname, 'templates/scss-hd.template.mustache')
      }
    };
    grunt.util._.extend(ldSpritesmithParams.ld, spritesmithParams);

    /*============================
    PREP GRUNT-SPRITESMITH
    ==============================*/

    var allParams = grunt.util._.extend(hdSpritesmithParams, ldSpritesmithParams);

    grunt.task.loadNpmTasks('grunt-spritesmith');
    grunt.task.loadNpmTasks('grunt-contrib-clean');
    grunt.config.init({ 'sprite': allParams });

    /*============================
    RUN GRUNT-SPRITESMITH
    ==============================*/

    // HD (run right away)
    grunt.task.run('sprite:hd');

    // LD (runs when all LD assets have been created)
    var runLdSpritesmith = function () {
      grunt.task.run('sprite:ld');

      grunt.config.set('clean', {
        'ld-assets': { 'src': [ldAssetDir, hdAssetDir]}
      });
      grunt.task.run('clean:ld-assets');
    };

  };

  // Register the task with Grunt.
  grunt.registerMultiTask('spriteHD', 'HD-ready spritesheets for the modern era.', spriteHD);
};