# Motion sensing using the doppler effect
[This is an implementation](http://danielrapp.github.io/doppler/) of the [SoundWave paper](http://research.microsoft.com/en-us/um/redmond/groups/cue/publications/guptasoundwavechi2012.pdf)
on the web. It enables you to detect motion using only the microphone and speakers!

## How to use it
Just run it like this
```javascript
doppler.init(function(bandwidth) {
  console.log(bandwidth.left - bandwidth.right);
});
```
See more in [example.html](example.html). Read more about the theory of how this works [on the github-pages site](http://danielrapp.github.io/doppler/).
