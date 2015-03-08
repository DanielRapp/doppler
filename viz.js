var showAxes = function() {
  document.getElementById('spectrum-axes').style.display = "block";
  document.getElementById('spectrum-zoom-axes').style.display = "block";
};

var drawBall = function(ctx, pos) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "rgb(0,0,0)";

  var normalizedX = Math.floor( 0.5 * ctx.canvas.width );
  var normalizedY = Math.floor( 0.5 * ctx.canvas.height );
  var maxSize = 100;
  var normalizedSize = maxSize/2 + Math.floor( pos/30 * maxSize );
  ctx.fillRect( normalizedX - normalizedSize/2,
                ctx.canvas.height - normalizedY - normalizedSize/2,
                normalizedSize, normalizedSize );
};

var drawFrequencies = function(ctx, analyser, freqs, primaryTone, startFreq, endFreq) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "rgb(0,0,0)";

  var primaryVolume = freqs[primaryTone];
  // For some reason, primaryVolume becomes 0 on firefox, I have no idea why
  if (primaryVolume == 0) {
    primaryVolume = 255;
  }
  for (var i = 0; i < (endFreq-startFreq); i++) {
    var volume = freqs[startFreq+i];
    var normalizedX = Math.floor( i/(endFreq-startFreq) * ctx.canvas.width );
    var normalizedY = Math.floor( 0.9 * volume/primaryVolume * ctx.canvas.height );
    ctx.fillRect( normalizedX, ctx.canvas.height - normalizedY - 5, 5, 5 );
  }
};
