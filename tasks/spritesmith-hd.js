// Node modules.
var gm = require("gm"),
    grunt = require("grunt"),
    gruntSpritesmith = require("grunt-spritesmith"),
    path = require("path");

module.exports = function(grunt) {

  // The function that constitutes the Grunt task.
  var spriteHD = function() {

    var done = this.async();

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
        hdStyleName  = "_sprite-" + spriteName + "-hd.scss",
        hdStylePath  = path.join(destCSS, hdStyleName),
        hdAssetDir   = 'tempAssets/' + hdPrefix + "-" + spriteName + "-assets",

        ldImageName  = ldPrefix + "-" + spriteName + "." + imageType,
        ldImagePath  = path.join(destImg, ldImageName),
        ldImageUrl   = path.join(imgUrl, ldImageName),
        ldStyleName  = "_sprite-" + spriteName + ".scss",
        ldStylePath  = path.join(destCSS, ldStyleName),
        ldAssetDir   = 'tempAssets/' + ldPrefix + "-" + spriteName + "-assets",

        regImageName = spriteName + "." + imageType,
        regImagePath = path.join(destImg, regImageName),
        regImageUrl  = path.join(imgUrl, regImageName),
        regStyleName = "_sprite-" + spriteName + ".scss",
        regStylePath = path.join(destCSS, ldStyleName),

        spritesmithParams = {
          'algorithm': algorithm,
          'engine': engine,
          'engineOpts': engineOpts,
          'imageOpts': imageOpts
        };

    grunt.task.loadNpmTasks('grunt-spritesmith');
    grunt.task.loadNpmTasks('grunt-contrib-clean');


    /*============================
    IF NO HD, RUN REGULAR SPRITESMITH
    ==============================*/

    if (!hd) {
      var regSpritesmithParams = {
        'reg': {
          'src': src,
          'destImg': regImagePath,
          'destCSS': regStylePath,
          'imgPath': regImageUrl,
          'padding': padding,
          'cssOpts': cssOpts
        }
      };
      grunt.util._.extend(regSpritesmithParams.reg, spritesmithParams);

      var regConfig = grunt.util._.extend(grunt.config.get(), { 'sprite': regSpritesmithParams});
      grunt.config.init(regConfig);
      gruntSpritesmith(grunt);
      grunt.task.run('sprite:reg');
      grunt.log.ok('Regular spritesheet created.');
      done(true);
      return;
    }


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
        grunt.log.ok('LD assets done.');
        doIt();
      }
    };

    // The loop.
    for (var i = 0, len = srcFiles.length; i < len; i++) {
      // For each file:
      // - add its name to resizedImages array;
      // - create a 50%-sized duplicate in ldAssetsDir;
      // - check for errors;
      // - if it's the last one, run spritesmith.
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

    var doIt = function () {

      grunt.log.ok("Doing it ...");

      /*============================
      PREP SPRITESMITH SETTINGS
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

      var ldSpritesmithParams = {
        'ld': {
          'src': [ldAssetDir + '/*'],
          'destImg': ldImagePath,
          'destCSS': ldStylePath,
          'imgPath': ldImageUrl,
          'padding': padding,
          'cssTemplate': path.join(__dirname, 'templates/scss-hd.template.mustache')
        }
      };
      ldSpritesmithParams.ld.cssOpts = grunt.util._.extend(cssOpts, { 'hdPath': hdStyleName });
      grunt.util._.extend(ldSpritesmithParams.ld, spritesmithParams);

      var allParams = grunt.util._.extend(hdSpritesmithParams, ldSpritesmithParams);

      var config = grunt.util._.extend(grunt.config.get(), { 'sprite': allParams});
      grunt.config.init(config);

      /*============================
      RUN GRUNT-SPRITESMITH
      ==============================*/

      grunt.task.run('sprite:hd');
      grunt.task.run('sprite:ld');

      // When that's all done, delete temp assets
      process.on('exit', function () {
        grunt.log.ok('Deleting temporary assets ...');
        grunt.file.delete('tempAssets/');
      });

      // async business
      done(true);

    };

  };

  // Register the task with Grunt.
  grunt.registerMultiTask('spriteHD', 'HD-ready spritesheets for the modern era.', spriteHD);
};