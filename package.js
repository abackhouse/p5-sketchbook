Package.describe({
  name: 'coh:p5-sketchbook',
  version: '0.0.1',
  summary: 'p5 instance wrapper for p5js in Meteor apps',
  git: 'https://github.com/clappingonehand/p5-sketchbook',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: "wrapP5",
  use: ['spacebars-compiler', 'underscore'],
  sources: [
    'wrap-p5.js'
  ],
  npmDependencies: {
    esprima: "2.3.0",
    "js-beautify": "1.5.7"
  }
});

// Npm.depends({
//     p5: '0.0.4'
// })

// Package.onUse(function(api) {
//     api.versionsFrom('1.0');
//}
