// Node modules.
var gm = require('gm'),
    grunt = require('grunt'),
    gruntSpritesmith = require('grunt-spritesmith'),
    path = require('path');

module.exports = function(grunt) {

  // The function that constitutes the Grunt task.
  var spriteHD = function() {

    // Start async (required for grunt-spritesmith to work).
    var done = this.async();

    // Settings.
    var data = this.data,
        options = this.options(),
        src = data.src, // required
        spriteName = data.spriteName, // required

        // For grunt-spritesmith
        destImg = options.destImg || 'images/sprites',
        destCSS = options.destCSS || 'style/scss/sprites',
        imgPath = typeof options.imgPath === 'string' ? options.imgPath : path.relative(destCSS, destImg),
        algorithm = options.algorithm || 'binary-tree',
        padding = options.padding || 1,
        engine = options.engine || 'gm',
        engineOpts = options.engineOpts || {},
        imageOpts = options.imageOpts || {},
        cssOpts = options.cssOpts || {},
        algorithmOpts = options.algorithmOpts || {},

        // Other
        resizeEngine = options.resizeEngine || 'gm',
        assetFormats = options.assetFormats || ['.png', '.jpg', '.jpeg'],
        hd = options.hd !== false,
        hdPrefix = options.hdPrefix || 'hd',
        ldPrefix = options.ldPrefix || 'ld',
        imgType = 'png';

    // Derivations from the settings.
    var srcFiles = grunt.file.expand(src),
        tempAssets = 'tempAssets',

        hdImageName = hdPrefix + '-' + spriteName + '.' + imgType,
        hdDestImg = path.join(destImg, hdImageName),
        hdImgPath = path.join(imgPath, hdImageName),
        hdStyleName = '_sprite-' + spriteName + '-hd.scss',
        hdDestCSS = path.join(destCSS, hdStyleName),
        hdAssetDir = path.join(tempAssets, hdPrefix + '-' + spriteName + '-assets'),

        ldImageName = ldPrefix + '-' + spriteName + '.' + imgType,
        ldDestImg = path.join(destImg, ldImageName),
        ldImgPath = path.join(imgPath, ldImageName),
        ldStyleName = '_sprite-' + spriteName + '.scss',
        ldDestCSS = path.join(destCSS, ldStyleName),
        ldAssetDir = path.join(tempAssets, ldPrefix + '-' + spriteName + '-assets'),

        regImageName = spriteName + '.' + imgType,
        regDestImg = path.join(destImg, regImageName),
        regDestPath = path.join(imgPath, regImageName),
        regStyleName = '_sprite-' + spriteName + '.scss',
        regDestCSS = path.join(destCSS, ldStyleName),

        spritesmithParams = {
          'algorithm': algorithm,
          'algorithmOpts': algorithmOpts,
          'engine': engine,
          'engineOpts': engineOpts,
          'imageOpts': imageOpts
        };

    function deleteTempAssets() {
      grunt.log.ok('Deleting temporary assets ...');
      grunt.file.delete(tempAssets);
    }

    function end() {
      deleteTempAssets();
      done(true);
      return;
    }

    // Register grunt-spritesmith
    gruntSpritesmith(grunt);

    /*============================
    IF NO HD, RUN REGULAR SPRITESMITH
    ==============================*/

    if (!hd) {
      var regSpritesmithParams = {
        'reg': {
          'src': src,
          'destImg': regDestImg,
          'destCSS': regDestCSS,
          'imgPath': regDestPath,
          'padding': padding,
          'cssOpts': cssOpts
        }
      };
      grunt.util._.extend(regSpritesmithParams.reg, spritesmithParams);

      var regConfig = grunt.util._.extend(grunt.config.get(), { 'sprite': regSpritesmithParams});
      grunt.config.init(regConfig);
      grunt.task.run('sprite:reg');
      grunt.log.ok('Regular spritesheet created.');
      end();
    }

    /*============================
    Prepare resizer (either gm or im)
    ==============================*/
    // First, prepare to the gm module to use ImageMagick if it needs to
    var resizer = gm;
    if (resizeEngine !== 'gm') {
      if (resizeEngine === 'im') {
        grunt.log.ok('Setting resizer to ImageMagick ...');
        // per http://aheckmann.github.io/gm/docs.html#imagemagick
        resizer = gm.subClass({ imageMagick: true });
      } else {
        grunt.log.error('spritesmithHD\'s resizeEngine must be either `gm` (GraphicsMagick) or `im` (ImageMagick).');
        end();
      }
    }

    /*============================
    Create full-size assets for HD spritesheet
    ==============================*/

    grunt.log.writeln('Creating temporary ' + hdPrefix + ' assets ...');
    grunt.util._.forEach(srcFiles, function (file) {
      var newName = hdPrefix + '-' + path.basename(file);
      grunt.file.copy(file, path.join(hdAssetDir, newName));
    });

    /*============================
    Create resized assets for LD spritesheet
    ==============================*/

    grunt.log.writeln('Creating temporary ' + ldPrefix + ' assets ...');

    // Create the LD asset directory.
    if (grunt.file.exists(ldAssetDir)) {
      grunt.log.error('An existing directory is getting in the way of spritesmithHD creating a temporary LD asset directory at ' + ldAssetDir + '. It\'s being overwritten.');
      deleteTempAssets();
    }
    grunt.file.mkdir(ldAssetDir);

    // For each file:
    // - add its name to resizedImages array;
    // - create a 50%-sized duplicate in ldAssetsDir;
    // - check for errors;
    // - if it's the last one, run spritesmith.

    var resizedImages = [],
        i = 0,
        counter = function (err) {
          if (err) {
            grunt.log.error(err);
            end();
          }
          i++;
          if (i === srcFiles.length) {
            grunt.log.ok('LD assets done.');
            makeSpritesmithGo();
          }
        };

    srcFiles.forEach(function (file) {
      var ext = path.extname(file);

      if (grunt.util._.contains(assetFormats, ext)) {
        var filename = path.basename(file),
            pathToTarget = path.join(ldAssetDir, filename);
        resizedImages.push(pathToTarget);
        resizer(file).resize(50, 50, '%')
          .write(pathToTarget, counter);
      }
    });


    var makeSpritesmithGo = function () {

      /*============================
      PREP SPRITESMITH SETTINGS
      ==============================*/

      var hdSpritesmithParams = {
        'hd': {
          'src'    : [hdAssetDir + '/*'],
          'destImg': hdDestImg,
          'destCSS': hdDestCSS,
          'imgPath': hdImgPath,
          'padding': padding * 2,
          'cssOpts': {
            'functions': false
          }
        }
      };
      grunt.util._.extend(hdSpritesmithParams.hd, spritesmithParams);

      var ldSpritesmithParams = {
        'ld': {
          'src'    : [ldAssetDir + '/*'],
          'destImg': ldDestImg,
          'destCSS': ldDestCSS,
          'imgPath': ldImgPath,
          'padding': padding,
          'cssTemplate': path.join(__dirname, 'templates/scss-hd.template.mustache')
        }
      };
      ldSpritesmithParams.ld.cssOpts = grunt.util._.extend(cssOpts, {
        'hdPath': hdStyleName,
        'hdPrefix': hdPrefix
      });
      grunt.util._.extend(ldSpritesmithParams.ld, spritesmithParams);

      var allParams = grunt.util._.extend(hdSpritesmithParams, ldSpritesmithParams),
          config    = grunt.util._.extend(grunt.config.get(), { 'sprite': allParams });
      grunt.config.init(config);

      /*============================
      RUN GRUNT-SPRITESMITH
      ==============================*/

      grunt.task.run('sprite:hd');
      grunt.task.run('sprite:ld');

      // When that's all done, delete temp assets
      process.on('exit', deleteTempAssets);

      // async business
      done(true);

    };

  };

  // Register the task with Grunt.
  grunt.registerMultiTask('spriteHD', 'HD-ready spritesheets with grunt.', spriteHD);
};