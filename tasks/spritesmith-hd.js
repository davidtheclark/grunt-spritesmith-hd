// Node modules.
var gm = require("gm"),
    path = require("path"),
    spritesmith = require("spritesmith"),
    json2css = require("json2css");

module.exports = function(grunt) {

  // The function that constitutes the grunt task.
  var spritesmithHd = function() {

    // settings
    var data = this.data,
        options = this.options(),
        src = data.src, // required
        spriteName = data.spriteName, // required
        assetFormats = options.assetFormats || ['.png', '.jpg', '.jpeg'],
        destImg = options.destImg || 'images/sprites',
        destCSS = options.destCSS || 'style/scss/sprites',
        hd = options.hd || false,
        hdPrefix = options.hdPrefix || 'hd',
        ldPrefix = options.ldPrefix || 'ld',
        imageType = options.imageType || 'png',
        algorithm = options.algorithm || "binary-tree",
        padding = options.padding || 1,
        engineOpts = options.engineOpts || {},
        engine = options.engine || "gm",
        cssOpts = options.cssOpts || {},
        imgUrl = options.imgUrl || path.relative(destCSS, destImg);

    // ensure required settings have been entered
    if (!src || !spriteName) {
      return grunt.log.error("The sprite-hd task requires a src and spriteName.");
    }

    // derivations from the settings
    var srcFiles = grunt.file.expand(src),
        hdSpritesheetName = hdPrefix + "-" + spriteName + "." + imageType,
        hdSpritesheetPath = path.join(destImg, hdSpritesheetName),
        ldSpritesheetName = ldPrefix + "-" + spriteName + "." + imageType,
        ldSpritesheetPath = path.join(destImg, ldSpritesheetName),
        regSpritesheetName = spriteName + "." + imageType,
        regSpritesheetPath = path.join(destImg, regSpritesheetName),
        stylesheetName = "_sprite-" + spriteName + ".scss",
        stylesheetPath = path.join(destCSS, stylesheetName),
        ldAssetDir = ldPrefix + "-" + spriteName + "-assets";

    // general spritesmith params (needs a src added before use)
    var spritesmithParams = {
      'engine': engine,
      'algorithm': algorithm,
      'padding': padding,
      'exportOpts': {
        format: imageType
      }
    };

    // async it (spritesmith requires this)
    var done = this.async();


    var runSpritesmith = function(assets, prefix, callback) {

      // Check for assets.
      if (!assets) {
        grunt.fatal("No assets were passed to spritesmith.");
      }

      // Prepare prefix for its place in a string.
      var prefixSpaced = (prefix) ? ' ' + prefix + ' ' : ' ';

      // Prepare a path for the spritesheet.
      var spritesheetPath = (prefix === hdPrefix) ? hdSpritesheetPath : (prefix === ldPrefix) ? ldSpritesheetPath : regSpritesheetPath;

      var start = function() {
        // Run spritesmith.
        var params = grunt.util._.extend(spritesmithParams, { src: assets });
        spritesmith(params, createSpritesheet);
        grunt.log.writeln("Running spritesmith on" + prefixSpaced + "assets ...");
      };

      var createSpritesheet = function(err, result) {
        // Spritesmith callback:
        // Create a spritesheet from spritesmith result.
        if (err) {
          grunt.fatal(err);
          return done(err);
        } else {
          grunt.file.write(spritesheetPath, result.image, { encoding: "binary" });
          grunt.log.ok("Created" + prefixSpaced + "spritesheet '" + spritesheetPath + "'.");

          // Once that's all done, run the callback, passing the result.
          callback(result);
        }
      };

      start();

    };


    /*============================
    Create resized assets for a LD spritesheet
    ==============================*/

    var resizeImages = function() {

      var files = srcFiles;

      grunt.log.writeln("Creating temporary " + ldPrefix + " assets ...");
      // create the LD asset directory
      if (!grunt.file.exists(ldAssetDir)) {
        grunt.file.mkdir(ldAssetDir);
      } else {
        grunt.log.error("An existing directory is getting in the way of spritesmith-hd creating a temporary LD asset directory at '" + ldAssetDir + "'.");
      }
      var resizedImages = [];
      var loopOngoing = function(err) {
        if (err) {
          grunt.log.error(err);
        }
      };
      var loopDone = function(err) {
        // When the loop is done, the resized images to the function that runs spritesmith.
        if (err) {
          grunt.log.error(err);
        } else {
          runSpritesmith(resizedImages, ldPrefix, createStylesheet);
        }
      };

      // The loop.
      var len = files.length;
      for (var i = 0; i < len; i++) {
        /* For each file: add its name to resizedImages array;
        create a 50%-sized duplicate in ldAssetsDir; check for errors; if it's the last one, run spritesmith. */
        var file = files[i];
        var ext = path.extname(file);
        if (grunt.util._.contains(assetFormats, ext)) {
          var filename = path.basename(file);
          var pathToTarget = path.join(ldAssetDir, filename);
          var cb = (i === len - 1) ? loopDone : loopOngoing;
          resizedImages.push(pathToTarget);
          gm(file).resize(50, 50, "%").write(pathToTarget, cb);
        }
      }
    };


    /*============================
    Create the SCSS stylesheet.
    ==============================*/

    var createStylesheet = function(result) {
      // "result" is output by spritesmith.

      var items = [],
          coordinates = result.coordinates,
          properties = result.properties,
          baseSpritesheet = (hd) ? ldSpritesheetName : regSpritesheetName;

      // Prepare data for json2css.
      for (var key in coordinates) {
        var coordinate = coordinates[key],
            ext = path.extname(key);
        coordinate.name = path.basename(key, ext);
        coordinate.total_width = properties.width;
        coordinate.total_height = properties.height;
        coordinate.image = path.join(imgUrl, baseSpritesheet);
        items.push(coordinate);
      }

      // If HD, use the HD template; otherwise, the regular SCSS one.
      var scss, formatOpts;

      if (hd) {
        var hdTemplate = grunt.file.read(path.join(__dirname, "templates", "scss-hd.template.mustache"), "utf-8");
        json2css.addMustacheTemplate("scss-hd", hdTemplate);
        // Feed custom variable(s) into the template.
        formatOpts = grunt.util._.extend(cssOpts, {
          "hdSpritesheetPath": path.join(imgUrl, hdSpritesheetName)
        });
        scss = json2css(items, {
          "format": "scss-hd",
          "formatOpts": formatOpts
        });
        // Delete the temporary LD assets.
        grunt.log.writeln("Deleting temporary LD assets ...");
        grunt.file.delete(ldAssetDir);
      } else {
        formatOpts = cssOpts;
        scss = json2css(items, {
          "format": "scss",
          "formatOpts": formatOpts
        });
      }

      // Create the stylesheet.
      grunt.file.write(stylesheetPath, scss);
      grunt.log.ok("Created stylesheet '" + stylesheetPath + "'.");

      // Finish up (async business).
      done(true);
    };

    /*============================
    INITIALIZATION

    If HD is set, generate the HD spritesheet,
    resize the images, generate the LD spritesheet,
    then generate the stylesheet. Otherwise,
    just generate a spritesheet and stylesheet.
    ==============================*/

    if (hd) {
      runSpritesmith(srcFiles, hdPrefix, resizeImages);
    } else {
      runSpritesmith(srcFiles, false, createStylesheet);
    }


  };

  grunt.registerMultiTask('sprite-hd', 'Your task description goes here.', spritesmithHd);
};