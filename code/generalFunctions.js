


function product_Range(a, b) {
    var prd = a, i = a;

    while (i++ < b) {
        prd *= i;
    }
    return prd;
}


function combinations(n, r) {
    if (n == r) {
        return 1;
    }
    else {
        r = (r < n - r) ? n - r : r;
        return product_Range(r + 1, n) / product_Range(1, n - r);
    }
}


Array.prototype.compare = function (array) {
    if (!array) {
        return false;
    }
    if (this.length !== array.length) {
        return false;
    }
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].compare(array[i])) {
                return false;
            }
        }
        else if (this[i] !== array[i]) {
            return false;
        }
    }
    return true;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

        // swap elements array[i] and array[j]
        // we use "destructuring assignment" syntax to achieve that
        // you'll find more details about that syntax in later chapters
        // same can be written as:
        // let t = array[i]; array[i] = array[j]; array[j] = t
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// Sound object
function Sound(filePath, audioContext, gainNode, loop = false) {
    let my = this;
    // let testAudio;
    let xhr;

    // Initialize fields (constructor stuff)
    this.buffer = null;
    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.loop = loop;

    // Check for file type compatibility
    testAudio = document.createElement("audio");

    // Fetch the file
    xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(filePath), true);
    xhr.responseType = 'arraybuffer';
    // xhr.onload = function() {
    //     context.decodeAudioData(xhr.response, function(buffer) {
    //       my.buffer = buffer;
    //     }, onError);
    //   }
    // Oopsie doopsie, couldn't fetch the file
    xhr.addEventListener("error", function () {
        console.log('Error loading from server: ' + filePath);
    }, false);
    // On successful load, decode the audio data
    xhr.addEventListener("load", function () {
        audioContext.decodeAudioData(xhr.response,
            // Success
            function (audioBuffer) {
                my.buffer = audioBuffer;
            },
            // Error
            function (e) {
                console.log("Error decoding audio data: " + e.err);
            });
    }, false);
    xhr.send();
}

// Play function, for playing the sound
Sound.prototype.play = function () {
    let thisObject = this;

    // Play the sound only if it's been decoded already
    if (this.buffer) {
        let bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = this.buffer;
        bufferSource.connect(this.gainNode).connect(this.audioContext.destination);
        bufferSource.start(0);
        bufferSource.loop = this.loop;
    }

    // If it hasn't been decoded yet, check every 50ms to see if it's ready
    else {
        window.setTimeout(function () {
            thisObject.play();
        }, 50);
    }
}
