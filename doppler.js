window.doppler = (function() {
  var AuContext = (window.AudioContext ||
                   window.webkitAudioContext ||
                   window.mozAudioContext ||
                   window.oAudioContext ||
                   window.msAudioContext);

  var ctx = new AuContext();
  var osc = ctx.createOscillator();

  // This is just preliminary, we'll actually do a quick scan
  // (as suggested in the paper) to optimize this.
  var freq = 20000;

  // See paper for this particular choice of frequencies
  var relevantFreqWindow = 33;

// Settings and variables to attempt auto-calibration
  var calibrationData = {
    calibrationOn: true,
    previousDiff: 0,
    previousDirection: 0,
    directionChanges: 0,
    iteration: 0,
    maxVolumeRatio: 0.01,
    iterationCycles: 20,
    upThreshold: 5,
    downThreshold: 0,
    upAmount: 1.1,
    downAmount: 0.95
  };

  var getBandwidth = function(analyser, freqs) {
    var primaryTone = freqToIndex(analyser, freq);
    var primaryVolume = freqs[primaryTone];
    // This ratio is totally empirical (aka trial-and-error).
    var maxVolumeRatio = 0.01;

    var leftBandwidth = 0;
    do {
      leftBandwidth++;
      var volume = freqs[primaryTone-leftBandwidth];
      var normalizedVolume = volume / primaryVolume;
    } while (normalizedVolume > calibrationData.maxVolumeRatio && leftBandwidth < relevantFreqWindow);

    var rightBandwidth = 0;
    do {
      rightBandwidth++;
      var volume = freqs[primaryTone+rightBandwidth];
      var normalizedVolume = volume / primaryVolume;
    } while (normalizedVolume > calibrationData.maxVolumeRatio && rightBandwidth < relevantFreqWindow);

    return { left: leftBandwidth, right: rightBandwidth, diff: leftBandwidth-rightBandwidth };
  };

  var freqToIndex = function(analyser, freq) {
    var nyquist = ctx.sampleRate / 2;
    return Math.round( freq/nyquist * analyser.fftSize/2 );
  };

  var indexToFreq = function(analyser, index) {
    var nyquist = ctx.sampleRate / 2;
    return nyquist/(analyser.fftSize/2) * index;
  };

  var optimizeFrequency = function(osc, analyser, freqSweepStart, freqSweepEnd) {
    var oldFreq = osc.frequency.value;

    var audioData = new Uint8Array(analyser.frequencyBinCount);
    var maxAmp = 0;
    var maxAmpIndex = 0;

    var from = freqToIndex(analyser, freqSweepStart);
    var to   = freqToIndex(analyser, freqSweepEnd);
    for (var i = from; i < to; i++) {
      osc.frequency.value = indexToFreq(analyser, i);
      analyser.getByteFrequencyData(audioData);

      if (audioData[i] > maxAmp) {
        maxAmp = audioData[i];
        maxAmpIndex = i;
      }
    }
    // Sometimes the above procedure seems to fail, not sure why.
    // If that happends, just use the old value.
    if (maxAmpIndex == 0) {
      return oldFreq;
    }
    else {
      return indexToFreq(analyser, maxAmpIndex);
    }
  };

  var readMicInterval = 0;
  var readMic = function(analyser, userCallback) {
    var audioData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioData);

    var band = getBandwidth(analyser, audioData);
    if (calibrationData.calibrationOn == true) autoCalibrate(band);
    userCallback(band);

    readMicInterval = setTimeout(readMic, 1, analyser, userCallback);
  };

  var handleMic = function(stream, callback, userCallback) {
    // Mic
    var mic = ctx.createMediaStreamSource(stream);
    var analyser = ctx.createAnalyser();

    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 2048;

    mic.connect(analyser);

    // Doppler tone
    osc.frequency.value = freq;
    osc.type = osc.SINE;
    osc.start(0);
    osc.connect(ctx.destination);

    // There seems to be some initial "warm-up" period
    // where all frequencies are significantly louder.
    // A quick timeout will hopefully decrease that bias effect.
    setTimeout(function() {
      // Optimize doppler tone
      freq = optimizeFrequency(osc, analyser, 19000, 22000);
      osc.frequency.value = freq;

      clearInterval(readMicInterval);
      callback(analyser, userCallback);
    });
  };

// 1 if positive, -1 if negative, 0 all other times, including errors.
  var sign = function(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : 0 : 0;
  }

  // Try to auto-calibrate by looking for a large number of directional flip-flops
  var autoCalibrate = function(band) {
    var cd = calibrationData; //alias
    var direction = sign(band.diff);

    // If the direction has changed, count the flip
    if (cd.previousDirection != direction) {
      cd.directionChanges++;
      cd.previousDirection = direction;
    }

    // Increment the iteration counter and only calibrate after X cycles
    cd.iteration = ((cd.iteration + 1) % cd.iterationCycles);
    if (cd.iteration == 0) {
      if (cd.directionChanges >= cd.upThreshold) cd.maxVolumeRatio *= cd.upAmount;
      if (cd.directionChanges <= cd.downThreshold) cd.maxVolumeRatio *= cd.downAmount;

      // Bound the volume ratio to prevent irrecoverable errors
      cd.maxVolumeRatio = Math.min(0.95, cd.maxVolumeRatio);
      cd.maxVolumeRatio = Math.max(0.0001, cd.maxVolumeRatio);
      cd.directionChanges = 0;
    }

    // Uncomment for sanity check so you can see if this is working
    //console.log(cd.maxVolumeRatio);
  };

  var calibrate = function(newVal) {
    if (typeof newVal == "boolean") {
      calibrationData.calibrationOn = newVal;
    }
    return calibrationData.calibrationOn;
  };

  return {
    init: function(callback) {
      navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      navigator.getUserMedia_({ audio: { optional: [{ echoCancellation: false }] } }, function(stream) {
        handleMic(stream, readMic, callback);
      }, function() { console.log('Error!') });
    },
    stop: function () {
      clearInterval(readMicInterval);
    },
    calibrate: calibrate
  }
})(window, document);

