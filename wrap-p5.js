var esprima = Npm.require('esprima');
var path = Npm.require('path');
var beautify = Npm.require('js-beautify').js_beautify;

var wrapP5 = function (compileStep) {

  var fileContents = compileStep.read().toString('utf8');

  var lines = fileContents.split('\n');
  var output = [];
  var apiEvents = /preload|setup|draw|onDeviceMove|onDeviceTurn|keyPressed|keyReleased|keyTyped|keyIsDown|mouseMoved|mouseDragged|mousePressed|mouseReleased|mouseClicked|mouseWheel|touchStarted|touchMoved|touchEnded/g;

  _.each(lines, function(line) {

    var tokens = esprima.tokenize(line);
    //console.log(tokens);
    var tokenOutput = [];

    _.each(tokens, function(token, i) {

      if(token.type ===  "Identifier") {

        if (keywords.indexOf(token.value) !== -1){


          if(tokenOutput[i-1] === 'var')
            compileStep.error({message: 'Cannot use the local identifier '+token.value+' becasue it is within the p5 api'});

          if(apiEvents.test(token.value)){

            token.value = 'p.'+token.value+' = function';
            tokenOutput.splice(i-3, 3);

          } else {

            if(tokenOutput.length) {

              if(tokenOutput[i-1].value !== '.')
                token.value = 'p.'+token.value;

            } else {

              token.value = 'p.'+token.value;

            }
          }
        }
      }

      tokenOutput.push(token);

    });

    var compiledline = buildLine(tokenOutput);

    output.push(compiledline);

  });

  var name = compileStep.inputPath.split('.')[0];
  var instanceName = name+'_p5instance';

  var header = "Router && Router.route('/"+name+"', { template: '"+instanceName+"' });\n\n" +
        "if(Meteor.isClient){\n\n" +
        "Template."+instanceName+".rendered = function() {\n\n" +
        "var s = function(p) {\n\n";

  var footer = "};\n\n" +
        "var "+instanceName+" = new p5(s, '"+instanceName+"');\n\n" +
        "}}";

  output.unshift(header);
  output.push(footer);

  var code = output.join('\n');
  var prettyCode = beautify(code, {indent_size: 2}); //worth cleaning up


  var templateName = JSON.stringify("Template." + instanceName);
  var resultsjs = '';
  var contents = '<div id="'+instanceName+'"></div>';
  var nameString = JSON.stringify(instanceName);

  var renderFuncCode = SpacebarsCompiler.compile(
    contents, {
      isTemplate: true,
      sourceName: 'Template "' + instanceName + '"'
    });

  resultsjs += "\nTemplate.__checkName(" + nameString + ");\n" +
    "Template[" + nameString + "] = new Template(" +
    templateName + ", " + renderFuncCode + ");\n";

  var path_part = path.dirname(compileStep.inputPath);
  if (path_part === '.')
    path_part = '';
  if (path_part.length && path_part !== path.sep)
    path_part = path_part + path.sep;
  var ext = path.extname(compileStep.inputPath);
  var basename = path.basename(compileStep.inputPath, ext);

  compileStep.addJavaScript({
    path: path.join(path_part, "template." + basename + ".js"),
    sourcePath: compileStep.inputPath,
    data: resultsjs
  });

  compileStep.addJavaScript({
    path: instanceName+'.js',
    sourcePath: compileStep.inputPath,
    data: prettyCode
  });


  // console.log(prettyCode);

};

Plugin.registerSourceHandler("p5", {isTemplate: true, archMatching: 'web'}, wrapP5);


function buildLine (tokenOutput) {

  var lineResult = '';

  _.each(tokenOutput, function(token, i) {

    switch(token.value) {

    case '=':
      lineResult += ' '+token.value+' ';
      break;
    case 'var' || ',':
      lineResult += token.value+' ';
      break;
    default:
      lineResult += token.value;

    }

  });

  return lineResult;

}

var keywords = [
  'blue',
  'brightness',
  'color',
  'green',
  'hue',
  'lerpColor',
  'lightness',
  'red',
  'saturation',
  'background',
  'clear',
  'colorMode',
  'fill',
  'noFill',
  'noStroke',
  'stroke',
  'arc',
  'ellipse',
  'line',
  'point',
  'quad',
  'rect',
  'triangle',
  'ellipseMode',
  'noSmooth',
  'rectMode',
  'smooth',
  'strokeCap',
  'strokeJoin',
  'strokeWeight',
  'bezier',
  'bezierPoint',
  'bezierTangent',
  'curve',
  'curveTightness',
  'curvePoint',
  'curveTangent',
  'beginContour',
  'beginShape',
  'bezierVertex',
  'curveVertex',
  'endContour',
  'endShape',
  'quadraticVertex',
  'vertex',
  'HALF_PI',
  'PI',
  'QUARTER_PI',
  'TAU',
  'TWO_PI',
  'preload',
  'setup',
  'draw',
  'remove',
  'noLoop',
  'loop',
  'push',
  'pop',
  'redraw',
  'print',
  'frameCount',
  'focused',
  'cursor',
  'frameRate',
  'noCursor',
  'displayWidth',
  'displayHeight',
  'windowWidth',
  'windowHeight',
  'windowResized',
  'width',
  'height',
  'fullscreen',
  'devicePixelScaling',
  'getURL',
  'getURLPath',
  'getURLParams',
  'createCanvas',
  'resizeCanvas',
  'noCanvas',
  'createGraphics',
  'blendMode',
  'applyMatrix',
  'resetMatrix',
  'rotate',
  'scale',
  'shearX',
  'shearY',
  'translate',
  'deviceOrientation',
  'accelerationX',
  'accelerationY',
  'accelerationZ',
  'pAccelerationX',
  'pAccelerationY',
  'pAccelerationZ',
  'setMoveThreshold',
  'onDeviceMove',
  'onDeviceTurn',
  'keyIsPressed',
  'key',
  'keyCode',
  'keyPressed',
  'keyReleased',
  'keyTyped',
  'keyIsDown',
  'mouseX',
  'mouseY',
  'pmouseX',
  'pmouseY',
  'winMouseX',
  'winMouseY',
  'pwinMouseX',
  'pwinMouseY',
  'mouseButton',
  'mouseIsPressed',
  'mouseMoved',
  'mouseDragged',
  'mousePressed',
  'mouseReleased',
  'mouseClicked',
  'mouseWheel',
  'touchX',
  'touchY',
  'ptouchX',
  'ptouchY',
  'touches[]',
  'touchIsDown',
  'touchStarted',
  'touchMoved',
  'touchEnded',
  'createImage',
  'saveCanvas',
  'saveFrames',
  'loadImage',
  'image',
  'tint',
  'noTint',
  'imageMode',
  'pixels[]',
  'blend',
  'copy',
  'filter',
  'get',
  'loadPixels',
  'set',
  'updatePixels',
  'loadFont',
  'loadJSON',
  'loadStrings',
  'loadTable',
  'loadXML',
  'httpGet',
  'httpPost',
  'httpDo',
  'save',
  'saveJSON',
  'saveStrings',
  'saveTable',
  'createVector',
  'abs',
  'ceil',
  'constrain',
  'dist',
  'exp',
  'floor',
  'lerp',
  'log',
  'mag',
  'map',
  'max',
  'min',
  'norm',
  'pow',
  'round',
  'sq',
  'sqrt',
  'noise',
  'noiseDetail',
  'noiseSeed',
  'randomSeed',
  'random',
  'randomGaussian',
  'acos',
  'asin',
  'atan',
  'atan2',
  'cos',
  'sin',
  'tan',
  'degrees',
  'radians',
  'angleMode',
  'textAlign',
  'textLeading',
  'textSize',
  'textStyle',
  'textWidth',
  'text',
  'textFont',
  'append',
  'arrayCopy',
  'concat',
  'reverse',
  'shorten',
  'shuffle',
  'sort',
  'splice',
  'subset',
  'float',
  'int',
  'str',
  'boolean',
  'byte',
  'char',
  'unchar',
  'hex',
  'unhex',
  'join',
  'match',
  'matchAll',
  'nf',
  'nfc',
  'nfp',
  'nfs',
  'split',
  'splitTokens',
  'trim',
  'day',
  'hour',
  'minute',
  'millis',
  'month',
  'second',
  'year'
]
