# Motion sensing using the doppler effect
This is an implementation of the [SoundWave paper](http://research.microsoft.com/en-us/um/redmond/groups/cue/publications/guptasoundwavechi2012.pdf)
on the web. It enables you to detect motion using _only_ the microphone and speakers!

## How to use it
Just run it like this
``javascript
doppler.init(function(bandwidth) {
  console.log(bandwidth.left - bandwidth.right);
});
``
See more in [example.html](example.html).
