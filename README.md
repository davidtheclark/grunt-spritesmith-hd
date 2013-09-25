# grunt-spritesmith-hd

Uses grunt-spritesmith and some image and SCSS manipulation to generate HD-compatible sprites and corresponding SCSS stylesheets.

A work in progress.

## Requirements
This plugin uses the [grunt-spritesmith](https://github.com/Ensighten/grunt-spritesmith) task &mdash; so you'll need that installed into your project. Before installing grunt-spritesmith, though, [check out its own requirements](https://github.com/Ensighten/grunt-spritesmith#requirements) (`phantomjs`, `canvas`, or `gm`). Make sure you have one of those installed, then run

```base
npm install grunt-spritesmith --save-dev
```

If you want to use `phantomjs` or `canvas` for grunt-spritesmith, specify it in your options. (Otherwise, we'll fall back to the default `gm`).