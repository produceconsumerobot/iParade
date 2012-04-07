
function FileTransferRepeater(remoteFile, localFile, successCallback, failCallback) {
	console.log("FileTransferRepeater()");

	var _cancel = false;
	var maxTries = 20;
	var tryDelay = 500;
	var fileTransfer = new FileTransfer();

	this.cancel = function() {
		_cancel = true;
		fileTransfer = null;
	};
	
	this.download = function(nthTry) {
		console.log("FileTransferRepeater.download()");

		// function to try to get audio theme again
		function tryAgain(ntry) {
			if (ntry < maxTries) {
				// Wait and try try again...
				setTimeout(function() { if(!_cancel) {download(ntry);}}, ntry*tryDelay);
			}
		}

		// nthTry keeps track of number of attempts
		if (!nthTry) {
			nthTry = 1;
		} else {
			nthTry++;
		}

		
		fileTransfer.download(
				remoteFile,
				localFile,
				function(entry) {
					console.log("download complete: " + entry.fullPath);
					if (!_cancel){
						successCallback(entry);
					}
				},
				function(error) {
					console.log("download error source " + error.source);
					console.log("download error target " + error.target);
					console.log("upload error code" + error.code);
					// Try try again...
					if (!_cancel){
						tryAgain(nthTry);	
					}
				}
		);
		console.log("FileTransferRepeater.download() finished");
	};
	
	console.log("FileTransferRepeater() finished");
}

