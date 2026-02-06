var w, h, ctx,
    offscreenCanvas, offscreenCtx,

    opts = {

      len: 20,
      count: 80,
      baseTime: 10,
      addedTime: 10,
      dieChance: .05,
      spawnChance: 1,
      sparkChance: .1,
      sparkDist: 10,
      sparkSize: 2,

      color: 'hsl(hue,100%,light%)',
      baseLight: 50,
      addedLight: 10,
      shadowToTimePropMult: 6,
      baseLightInputMultiplier: .01,
      addedLightInputMultiplier: .02,

      repaintAlpha: .03,
      hueChange: .1,

      text: 'kremerman.me',
      fontSize: 0,
      fontFamily: '',
      textX: 0,
      textY: 0,
      textWidth: 0,
      origins: [],
      originCount: 0
    },

    tick = 0,
    lines = [],
    dieX, dieY,

    baseRad = Math.PI * 2 / 6;

function initializeCanvas() {

  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  ctx = c.getContext( '2d' );

  if( !offscreenCanvas ) {
    offscreenCanvas = document.createElement( 'canvas' );
    offscreenCtx = offscreenCanvas.getContext( '2d' );
  }
  offscreenCanvas.width = w;
  offscreenCanvas.height = h;

  opts.fontSize = Math.max( 60, Math.min( w * 0.12, 140 ) );
  opts.fontFamily = '900 ' + opts.fontSize + 'px "Source Code Pro", "Courier New", monospace';

  ctx.font = opts.fontFamily;
  opts.textWidth = ctx.measureText( opts.text ).width;
  opts.textX = w / 2;
  opts.textY = h / 2;

  opts.originCount = Math.max( 5, Math.floor( opts.textWidth / 80 ) );
  opts.origins = [];

  var leftEdge = opts.textX - opts.textWidth / 2,
      rightEdge = opts.textX + opts.textWidth / 2;

  for( var i = 0; i < opts.originCount; ++i ) {
    opts.origins.push({
      cx: leftEdge + ( rightEdge - leftEdge ) * ( i / ( opts.originCount - 1 ) ),
      cy: opts.textY + ( Math.random() - 0.5 ) * opts.fontSize * 0.3
    });
  }

  dieX = ( opts.textWidth / 2 + opts.fontSize ) / opts.len;
  dieY = ( opts.fontSize * 2 ) / opts.len;

  offscreenCtx.fillStyle = 'black';
  offscreenCtx.fillRect( 0, 0, w, h );
}

initializeCanvas();

function loop() {

  window.requestAnimationFrame( loop );

  ++tick;

  // --- Off-screen: render sparks with trails ---
  offscreenCtx.globalCompositeOperation = 'source-over';
  offscreenCtx.shadowBlur = 0;
  offscreenCtx.fillStyle = 'rgba(0,0,0,' + opts.repaintAlpha + ')';
  offscreenCtx.fillRect( 0, 0, w, h );
  offscreenCtx.globalCompositeOperation = 'lighter';

  if( lines.length < opts.count && Math.random() < opts.spawnChance )
    lines.push( new Line );

  lines.map( function( line ){ line.step(); } );

  // --- Main canvas: text mask compositing ---
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.clearRect( 0, 0, w, h );
  ctx.fillStyle = 'white';
  ctx.font = opts.fontFamily;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText( opts.text, opts.textX, opts.textY );

  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage( offscreenCanvas, 0, 0 );

  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, w, h );
}

function Line() {

  this.reset();
}
Line.prototype.reset = function() {

  this.x = 0;
  this.y = 0;
  this.addedX = 0;
  this.addedY = 0;

  this.rad = 0;

  this.lightInputMultiplier = opts.baseLightInputMultiplier + opts.addedLightInputMultiplier * Math.random();

  this.color = opts.color.replace( 'hue', tick * opts.hueChange );
  this.cumulativeTime = 0;

  this.origin = opts.origins[ Math.floor( Math.random() * opts.origins.length ) ];

  this.beginPhase();
}
Line.prototype.beginPhase = function() {

  this.x += this.addedX;
  this.y += this.addedY;

  this.time = 0;
  this.targetTime = ( opts.baseTime + opts.addedTime * Math.random() ) |0;

  this.rad += baseRad * ( Math.random() < .5 ? 1 : -1 );
  this.addedX = Math.cos( this.rad );
  this.addedY = Math.sin( this.rad );

  if( Math.random() < opts.dieChance || this.x > dieX || this.x < -dieX || this.y > dieY || this.y < -dieY )
    this.reset();
}
Line.prototype.step = function() {

  ++this.time;
  ++this.cumulativeTime;

  if( this.time >= this.targetTime )
    this.beginPhase();

  var prop = this.time / this.targetTime,
      wave = Math.sin( prop * Math.PI / 2 ),
      x = this.addedX * wave,
      y = this.addedY * wave;

  offscreenCtx.shadowBlur = prop * opts.shadowToTimePropMult;
  offscreenCtx.fillStyle = offscreenCtx.shadowColor = this.color.replace( 'light', opts.baseLight + opts.addedLight * Math.sin( this.cumulativeTime * this.lightInputMultiplier ) );
  offscreenCtx.fillRect( this.origin.cx + ( this.x + x ) * opts.len, this.origin.cy + ( this.y + y ) * opts.len, 2, 2 );

  if( Math.random() < opts.sparkChance )
    offscreenCtx.fillRect( this.origin.cx + ( this.x + x ) * opts.len + Math.random() * opts.sparkDist * ( Math.random() < .5 ? 1 : -1 ) - opts.sparkSize / 2, this.origin.cy + ( this.y + y ) * opts.len + Math.random() * opts.sparkDist * ( Math.random() < .5 ? 1 : -1 ) - opts.sparkSize / 2, opts.sparkSize, opts.sparkSize )
}

loop();

window.addEventListener( 'resize', function() {

  initializeCanvas();

  for( var i = 0; i < lines.length; ++i )
    lines[ i ].reset();
});
