# grunt-spritesmith-hd

Uses grunt-spritesmith and some image and SCSS manipulation to generate HD-compatible sprites and corresponding SCSS stylesheets.

## Requirements
This plugin uses the [grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith) task &mdash; so you'll need that installed into your project. Before installing grunt-spritesmith, though, [check out its own requirements](https://github.com/Ensighten/grunt-spritesmith#requirements) (`phantomjs`, `canvas`, or `gm`). Make sure you have one of those installed, then run

```base
npm install grunt-spritesmith --save-dev
```

If you want to use `phantomjs` or `canvas` for grunt-spritesmith, specify it in your options. (Otherwise, we'll fall back to the default `gm`).

## Installation

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

This one will need to be loaded specially, for now. Talk to Dave.

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-spritesmith-hd');
```

## Usage

*Run this task with the `grunt spriteHD` command.*

First, [have a look at the configuration options available for grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith#usage). Most of those relate to grunt-spritesmith-hd, except `cssFormat` and `cssTemplate`, since this plugin is all about special SCSS.

Unlike the original grunt-spritesmith, this plugin utilizes Grunt's `options`, so you can pass the same options to multiple targets.

### Required Parameters

**Any values provided below are defaults, unless noted.**

```javascript
grunt.inifConfig({
  spriteHD: {
    options: {
      // As for other Grunt plugins, options can be task-wide or
      // or target-specific.

      // ALL OPTIONS ARE OPTIONAL, because they all either have
      // default values or don't need any value.

      // Directory for the generated sprite image(s).
      destImg: 'images/sprites',

      // Directory for the generated SCSS file(s).
      destCSS: 'style/scss/sprites',

      // High-def-ready spritesheet or not?
      hd: true,

      // A packing algorithm. See https://github.com/Ensighten/grunt-spritesmith#algorithms.
      algorithm: 'binary-tree',

      // Padding between images on the generated spritesheet.
      padding: 1,

      // Specify your spritesmith engine. See https://github.com/Ensighten/grunt-spritesmith#requirements.
      engine: 'gm',

      // Specify settings for your engine. See https://github.com/Ensighten/grunt-spritesmith#gm-graphics-magick--image-magick.
      engineOpts: /* e.g. { 'imagemagick': true } */,

      // Specify image processing options. See https://github.com/Ensighten/grunt-spritesmith#usage.
      imageOpts: {},

      // Accepted extensions for your sprite assets.
      assetFormats: ['.png', '.jpg', '.jpeg'],

      // A prefix for your HD sprite files.
      hdPrefix: 'hd',

      // A prefix for your LD sprite files.
      ldPrefix: 'ld',

      // Manual override of the sprite image's
      // path stylesheet's background-image url(s). Useful
      // if the path from your destCSS (SCSS fiels) to your sprite image(s)
      // will not be the same as that from your compiled CSS; or if
      // you will be hosting the images elsewhere, eventually.
      imgUrl: /* e.g. http://s3.amazonaws.com/my-bucket/images */,

      cssOpts: /* e.g. { functions: false } */

    },
    targetName: {
      // The following parameters must be provided for every target.
      
      // An array of sprite assets/
      src: /* e.g. ['images/sprite-assets/*'] */,

      // A string to designate this sprite's files.
      spriteName: /* e.g. 'homepage' */
    }
  }
});
```



