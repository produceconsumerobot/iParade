function AudioPlayer(src) {
    //console.log("AudioPlayer(" + src + ")");

    var _uri = src,
        _mAudio = null,
        _audioTimer = null,
        _positionLoopTime = 500,
        _looping = false,
        _isPlaying = false;

    this.looping = function(looping) {
        //console.log("looping(" + looping + ")");// Play audio
        if (looping) {
            _looping = looping;
        }
        return _looping;
    };

    _mAudio = new Media(src, onSuccess, onError);

    function onSuccess() {
        //console.log("AudioPlayer.onSuccess()");
    }

    function onError(error) {
        console.error( 'AudioPlayer.onError:\n' +
                'code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
        this.release();
    }

    function checkAudioLoop() {
        //console.log("_looping=" + _looping);
        if (_looping) {
            //console.log("checkAudioLoop: looping");
            if (_mAudio){
                //console.log("checkAudioLoop: my_audio");
                if ((_mAudio._duration > -1) && (_mAudio._position > -1)) {
                    //console.log("checkAudioLoop: duration/position");
                    if ((_mAudio._duration - _mAudio._position) < 1.5){
                        //console.log("checkAudioLoop: seekTo 1");
                        _mAudio.seekTo(1);
                    }
                }
            }
        }
        //console.log("checkAudioLoop finished");
    }


    this.play = function() {
        //console.log("AudioPlayer.play(): " + _uri);// Play audio
        if (!_mAudio) {
            //console.log("AudioPlayer is null");
        } else {
            _mAudio.play();
            _isPlaying = true;
            // Update _mAudio position
            if (_audioTimer == null) {
                _audioTimer = setInterval(function() {
                    if (_mAudio) {
                        // get _mAudio position
                        _mAudio.getCurrentPosition(
                                // success callback
                                function(position) {
                                    //console.log("getCurrentPosition: success");
                                    if (position > -1) {
                                        if ((position % 5) < 1) { // Write to the console infrequently
                                            //console.log("AudioPosition: " + _mAudio._position + " / " + _mAudio._duration);
                                        }
                                        checkAudioLoop();
                                    }
                                },
                                // error callback
                                function(e) {
                                    //console.log("Error getting pos=" + e);
                                }
                        );
                    }
                }, _positionLoopTime);
            }
        }
        //console.log("AudioPlayer.play() finished");
    };

    // Pause audio
    //
    this.pause = function() {
        //console.log("pause()");
        if (_mAudio) {
            _mAudio.pause();
        }
        _isPlaying = false;
        //console.log("pause finished");
    };
    // Stop audio
    //
    this.stop = function() {
        //console.log("stop()");
        if (_mAudio) {
            _mAudio.stop();
        }
        if (_audioTimer) {
            clearInterval(_audioTimer);
        }
        _audioTimer = null;
        _isPlaying = false;
        //console.log("stop finished");
    };

    this.release = function() {
        //console.log("release()");
        this.stop();
        if (_mAudio) {
            _mAudio.release();
        }
        _mAudio = null;
        //console.log("release finished");
    };

    this.getUri = function() {
        if (_mAudio) {
            return _uri;
        } else {
            return null;
        }
    };

    this.isPlaying = function() {
        //console.log("AudioPlayer.isPlaying()");
        if (_mAudio && _isPlaying && (_mAudio._position > 0) && (_mAudio._position < _mAudio._duration)) {
            //console.log("AudioPlayer.isPlaying()==true");
            return true;
        } else {
            //console.log("AudioPlayer.isPlaying()==false");
            return false;
        }
    };

    //console.log("AudioPlayer finished");
}