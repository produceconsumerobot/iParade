
function FileTransferRepeater(remoteFile, localFile, successCallback, failCallback) {
	console.log("FileTransferRepeater()");
	console.log("FileTransferRepeater remoteFile = " + remoteFile);
	console.log("FileTransferRepeater localFile = " + localFile);
	
	var _cancel = false;
	var maxTries = 20;
	var tryDelay = 500;
	var fileTransfer = new FileTransfer();

	this.cancel = function() {
		_cancel = true;
		fileTransfer = null;
	};
	
	function download(nthTry) {
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
					console.log("transfer error code" + error.code);
					// Try try again...
					if (!_cancel){
						tryAgain(nthTry);	
					}
				}
		);
		console.log("FileTransferRepeater.download() finished");
	}
	
	this.download = function(nthTry) {
		download(nthTry);
	};
	
	console.log("FileTransferRepeater() finished");
}

