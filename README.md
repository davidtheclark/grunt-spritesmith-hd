# grunt-spritesmith-hd

> Uses [grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith) along with some image-manipulation and SCSS-trickery to generate HD-compatible sprites and corresponding SCSS stylesheets.

## Requirements

This plugin uses [grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith) &mdash; so you'll want to [check out its own requirements](https://github.com/Ensighten/grunt-spritesmith#requirements): PhantomJS, Canvas, or GraphicsMagick command-line-tools. Make sure you have one of those installed.

If you want to use PhantomJS or Canvas for grunt-spritesmith-hd, specify it in your options. Otherwise, it falls back to the default, GraphicsMagick.

(grunt-spritesmith-hd uses [GraphicsMagick for Node](http://aheckmann.github.io/gm/) for image processessing; but you don't have to worry about that, as it's automatically installed as an npm dependency. It will not, however, take the place of one of the command-line-tools listed above, since those are required by grunt-spritesmith.)

## Installation

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```js
npm install grunt-spritesmith-hd --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-spritesmith-hd');
```

## SpriteHD Task

*Run this task with the `grunt spriteHD` command.*

First, [have a look at the configuration options available for grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith#usage). Most of those relate to grunt-spritesmith-hd &mdash; except `cssFormat` and `cssTemplate`, since this plugin relies special SCSS.

*(If you would like grunt-spritesmith-hd to be more flexible, please contribute!)*

Unlike the original grunt-spritesmith, this plugin utilizes [Grunt's `options`](http://gruntjs.com/api/grunt.option), so you can pass the same options to multiple targets.

### Required Parameters

The following parameters must be defined for every target.

#### src

Type: `String | Array`

The assets that will be aggregated into your sprite.

#### spriteName

Type: `String`

A name that will designate your sprite's files.

For example, if you were to provide the `spriteName` "genuflect",  your sprite images would end up as `hd-genuflect.png` and `ld-genuflect.png` and your stylesheets would be `_sprite-genuflect.scss` and `_sprite-genuflect-hd.scss`.

### Options

As with other Grunt tasks, these options can be task-wide or target-specific.

*All of these options are optional*, because they all either have default values or can be ignored.

#### hd
Type: `Boolean`
Default: `true`

Do you want your spritesheet high-def-ready? Are your sprite assets 2x the size that they will appear?

Set to `false` if your sprite assets aren't up for it.

If `hd` is `false`, grunt-spritesmith-hd will simply run grunt-spritesmith with the parameters and options you've passed.

#### destImg
Type: `String`
Default: `images/sprites`

A directory where your generated sprite image(s) will go.

#### destCSS
Type: `String`
Default: `style/scss/sprites`

A directory where your generated SCSS file(s) will go.

#### hdPrefix
Type: `String`
Default: `hd`

A prefix for your high-def sprite files.

#### ldPrefix
Type: `String`
Default: `ld`

A prefix for your low-def sprite files.

#### algorithm
Options: `top-down`, `left-right`, `diagonal`, `alt-diagonal`, `binary-tree`
Default: `binary-tree`

A packing algorithm to use. [See details in grunt-spritesmith's documntation.](https://github.com/Ensighten/grunt-spritesmith#algorithms)

#### padding
Type: `Number`
Default: 1

Padding to be placed between images on the generated spritesheet(s).

#### engine
Options: `auto`, `phantomjs`, `canvas`, `gm`
Default: `gm`

Specify your spritesmith engine. [See details in grunt-spritesmith's documntation.](https://github.com/Ensighten/grunt-spritesmith#requirements)

#### engineOpts
Type: `Object`
Default: `{}`

Specify settings for your engine. [See details in grunt-spritesmith's documntation.](https://github.com/Ensighten/grunt-spritesmith#gm-graphics-magick--image-magick)

#### imageOpts
Type: `Object`
Default: `{}`

Specify image processing options. [See details in grunt-spritesmith's documntation.](https://github.com/Ensighten/grunt-spritesmith#usage)

#### assetFormats
Type: `Array`
Default: `['.png', '.jpg', '.jpeg']`

Accepted extensions for your sprite assets.

#### imgUrl
Type: `String`
Default: *The default value is the relative path between your `destCSS` and `destImg` directories.*

Manually override the sprite image's path in the generated stylesheet's `background-image` url(s). Here are a couple of use cases:

- If the relative path from your `destCSS` directory (where the SCSS files go) to your `destImg` directory (where your sprite images go) will not be the same as the relative path from your compiled CSS to `destImg`.
- If you will be hosting the images elsewhere, eventually, on a CDN or something.

#### cssOpts
Type: `Object`
Default: `{}`

Options to pass to the Mustache template that generates your stylesheets.

As of now, you have one real option, `{ functions: false }`, which will make it so the generated SCSS includes variables only, not mixins. This is handy if you are using multiple sprites in a project and don't want to duplicate the mixin definitions.

## Examples

```javascript
spriteHD: {
  options: {
    destImg: "sprites"
    destCSS: "scss/sprites"
    imgUrl: "sprites"
  }
  all {
    src: ["images/sprite-assets/all/*"]
    spriteName: "all"
  }
  home: {
    src: ["images/sprite-assets/home/*"]
    spriteName: "home"
    cssOpts: {
      functions: false
    }
  }
}
```

## Using the Output

After running grunt-spritesmith-hd, in your `destCSS` directory you will find an unprefixed SCSS file &mdash; that is the one you should import into your own SCSS/Sass.

For example, a typical HD sprite with the `spriteName` "everything" will output `_everything-hd.scss` and `_everything.scss` into `destCSS`. You need to `@import "path/to/everything"`.

(If you look inside `_everything.scss`, you'll see that already imports `_everything-hd.scss`, so you don't have to worry about it.)
