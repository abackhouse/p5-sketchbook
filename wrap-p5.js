var esprima = Npm.require('esprima');
var path = Npm.require('path');

var wrapP5 = function (compileStep) {
  // get file contents
  var fileContents = compileStep.read().toString('utf8');

  var lines = fileContents.split('\n');
  var output = [];

  lines.forEach(function(line) {
    var tokens = esprima.tokenize(line);
    var tokenOutput = [];
    tokens.forEach(function(token, i) {
      if(token.type ===  "Identifier") {
        if(keywords.indexOf(token.value+'()') > -1 || keywords.indexOf(token.value) > -1) {
          if (token.value === 'draw') {
            token.value = 'p.draw = function';
            tokenOutput.splice(i-3, 3);
          } else if (token.value === 'setup') {
            token.value = 'p.setup = function';
            tokenOutput.splice(i-3, 3);
          } else {
            token.value = 'p.'+token.value;
          }
        }
      }
      tokenOutput.push(token.value);
    });
    line = tokenOutput.join(' ');
    output.push(line);
  });

  var name = compileStep.inputPath.split('.')[0];
  var instanceName = name+'_p5instance';

  output.unshift('var s = function(p) {');
  output.unshift('Template.'+instanceName+'.rendered = function() {');
  output.unshift('if(Meteor.isClient){');
  output.unshift('Router && Router.route("/'+name+'", { template: "'+instanceName+'" });');
  output.push('}');

  output.push('var '+instanceName+' = new p5(s, "'+instanceName+'");');
  output.push('}}');

  var code = output.join('\n'); // should prettify

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

    // XXX generate a source map

  compileStep.addJavaScript({
    path: path.join(path_part, "template." + basename + ".js"),
    sourcePath: compileStep.inputPath,
    data: resultsjs
  });

  compileStep.addJavaScript({
    path: instanceName+'.js',
    sourcePath: compileStep.inputPath,
    data: code
  });


  console.log(code);

};

Plugin.registerSourceHandler("p5", {isTemplate: true, archMatching: 'web'}, wrapP5);


var keywords = [
  'blue()',
  'brightness()',
  'color()',
  'green()',
  'hue()',
  'lerpColor()',
  'lightness()',
  'red()',
  'saturation()',
  'background()',
  'clear()',
  'colorMode()',
  'fill()',
  'noFill()',
  'noStroke()',
  'stroke()',
  'arc()',
  'ellipse()',
  'line()',
  'point()',
  'quad()',
  'rect()',
  'triangle()',
  'ellipseMode()',
  'noSmooth()',
  'rectMode()',
  'smooth()',
  'strokeCap()',
  'strokeJoin()',
  'strokeWeight()',
  'bezier()',
  'bezierPoint()',
  'bezierTangent()',
  'curve()',
  'curveTightness()',
  'curvePoint()',
  'curveTangent()',
  'beginContour()',
  'beginShape()',
  'bezierVertex()',
  'curveVertex()',
  'endContour()',
  'endShape()',
  'quadraticVertex()',
  'vertex()',
  'HALF_PI',
  'PI',
  'QUARTER_PI',
  'TAU',
  'TWO_PI',
  'preload()',
  'setup()',
  'draw()',
  'remove()',
  'noLoop()',
  'loop()',
  'push()',
  'pop()',
  'redraw()',
  'print()',
  'frameCount',
  'focused',
  'cursor()',
  'frameRate()',
  'noCursor()',
  'displayWidth',
  'displayHeight',
  'windowWidth',
  'windowHeight',
  'windowResized',
  'width',
  'height',
  'fullscreen()',
  'devicePixelScaling()',
  'getURL()',
  'getURLPath()',
  'getURLParams()',
  'createCanvas()',
  'resizeCanvas()',
  'noCanvas()',
  'createGraphics()',
  'blendMode()',
  'applyMatrix()',
  'resetMatrix()',
  'rotate()',
  'scale()',
  'shearX()',
  'shearY()',
  'translate()',
  'deviceOrientation',
  'accelerationX',
  'accelerationY',
  'accelerationZ',
  'pAccelerationX',
  'pAccelerationY',
  'pAccelerationZ',
  'setMoveThreshold()',
  'onDeviceMove()',
  'onDeviceTurn()',
  'keyIsPressed',
  'key',
  'keyCode',
  'keyPressed()',
  'keyReleased()',
  'keyTyped()',
  'keyIsDown()',
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
  'mouseMoved()',
  'mouseDragged()',
  'mousePressed()',
  'mouseReleased()',
  'mouseClicked()',
  'mouseWheel()',
  'touchX',
  'touchY',
  'ptouchX',
  'ptouchY',
  'touches[]',
  'touchIsDown',
  'touchStarted()',
  'touchMoved()',
  'touchEnded()',
  'createImage()',
  'saveCanvas()',
  'saveFrames()',
  'loadImage()',
  'image()',
  'tint()',
  'noTint()',
  'imageMode()',
  'pixels[]',
  'blend()',
  'copy()',
  'filter()',
  'get()',
  'loadPixels()',
  'set()',
  'updatePixels()',
  'loadFont()',
  'loadJSON()',
  'loadStrings()',
  'loadTable()',
  'loadXML()',
  'httpGet()',
  'httpPost()',
  'httpDo()',
  'save()',
  'saveJSON()',
  'saveStrings()',
  'saveTable()',
  'createVector()',
  'abs()',
  'ceil()',
  'constrain()',
  'dist()',
  'exp()',
  'floor()',
  'lerp()',
  'log()',
  'mag()',
  'map()',
  'max()',
  'min()',
  'norm()',
  'pow()',
  'round()',
  'sq()',
  'sqrt()',
  'noise()',
  'noiseDetail()',
  'noiseSeed()',
  'randomSeed()',
  'random()',
  'randomGaussian()',
  'acos()',
  'asin()',
  'atan()',
  'atan2()',
  'cos()',
  'sin()',
  'tan()',
  'degrees()',
  'radians()',
  'angleMode()',
  'textAlign()',
  'textLeading()',
  'textSize()',
  'textStyle()',
  'textWidth()',
  'text()',
  'textFont()',
  'append()',
  'arrayCopy()',
  'concat()',
  'reverse()',
  'shorten()',
  'shuffle()',
  'sort()',
  'splice()',
  'subset()',
  'float()',
  'int()',
  'str()',
  'boolean()',
  'byte()',
  'char()',
  'unchar()',
  'hex()',
  'unhex()',
  'join()',
  'match()',
  'matchAll()',
  'nf()',
  'nfc()',
  'nfp()',
  'nfs()',
  'split()',
  'splitTokens()',
  'trim()',
  'day()',
  'hour()',
  'minute()',
  'millis()',
  'month()',
  'second()',
  'year()'
]
