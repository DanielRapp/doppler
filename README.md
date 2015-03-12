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

## Firefox?
Unfortunately this doesn't work on Firefox since it doesn't seem to support the `echoCancellation: false` parameter to navigator.getUserMedia. This means there's no way to turn off it filtering out the sounds which are coming from the computer itself (which is precisely what we want to measure).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D