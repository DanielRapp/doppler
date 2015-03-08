window.addEventListener('load', function(e) {
  var AuContext = (window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext ||
    window.msAudioContext);

  var ctx = new AuContext();

  var playNote = function(freq) {
    var gain = ctx.createGain();
    gain.gain.value = 0.06;
    gain.connect(ctx.destination);

    var osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.type = osc.SINE;
    osc.start(0);
    osc.connect(gain);

    return osc;
  }

  var data_notes = document.body.querySelectorAll('[data-note]');
  var osc = [];
  for (var i = 0; i < data_notes.length; i++) {
    data_notes[i].addEventListener('mouseover', function() {
      osc[i] = playNote( this.getAttribute('data-note') );
    });
    data_notes[i].addEventListener('mouseout', function() {
      osc[i].stop(0);
    });
  }

}, false);
