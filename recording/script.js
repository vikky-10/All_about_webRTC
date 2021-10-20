"use strict";
class Recorder {
  constructor() {
    // Defining all globals.
    this.mediaSource = new MediaSource();
    this.mediaRecorder;
    this.recordedBlobs;
    this.sourceBuffer;
    this.videoOutputVideo = document.querySelector("video#videoOutput");
    this.recordedVideo = document.querySelector("video#recorded");
    this.recordButton = document.querySelector("button#record");
    this.playButton = document.querySelector("button#play");
    this.downloadButton = document.querySelector("button#download");
    const constraints = {
      audio: true,
      video: true,
    };

    this.testIfProtocolVerified();
    this.attachHTMLEvents();

    // Get user permission,
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.handleSuccess(stream);
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  /**
   * Attaching all events to the HTML buttons.
   */
  attachHTMLEvents() {
    // Attach all actios to HTML buttons.
    this.recordButton.onclick = this.toggleRecording.bind(this);
    this.playButton.onclick = this.play.bind(this);
    this.downloadButton.onclick = this.download.bind(this);
  }

  /**
   * Testing if it is HTTPS or localhost. Non secured pages can't reach media accessories.
   */
  testIfProtocolVerified() {
    const isSecureOrigin =
      location.protocol === "https:" || location.hostname === "localhost";
    if (!isSecureOrigin) {
      console.error(
        `No HTTPS or localhost. Non secured pages can't reach media accessories`
      );
      return false;
    }
    return true;
  }

  /**
   * When user granting success, this function is firing.
   * @param {*} stream of video and audio
   */
  handleSuccess(stream) {
    this.recordButton.disabled = false;
    console.log("getUserMedia() got stream: ", stream);
    window.stream = stream;
    if (window.URL) {
      this.videoOutputVideo.src = window.URL.createObjectURL(stream);
    } else {
      this.videoOutputVideo.src = stream;
    }
  }

  /**
   * If user is not granting success, this function is firing.
   * @param {*} error
   */
  handleError(error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  /**
   * When data is available, pushing it to global array to be used on downloading.
   * @param {*} event
   */
  handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }

  /**
   * Stop or Start to record, incluing change the text.
   */
  toggleRecording() {
    if (this.recordButton.textContent === "Start Recording") {
      this.startRecording();
    } else {
      this.stopRecording();
      this.recordButton.textContent = "Start Recording";
      this.playButton.disabled = false;
      this.downloadButton.disabled = false;
    }
  }

  /**
   * Starting the record process. init mediaRecorder
   */
  startRecording() {
    this.recordedBlobs = [];
    let options = { mimeType: "video/webm;codecs=vp9" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(`${options.mimeType} is not Supported`);
      options = { mimeType: "video/webm;codecs=vp8" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(`${options.mimeType} is not Supported`);
        options = { mimeType: "video/webm" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(`${options.mimeType} is not Supported`);
          options = { mimeType: "" };
        }
      }
    }
    try {
      this.mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
      console.error(`Exception while creating MediaRecorder: ${e}`);
      return;
    }
    console.log(
      "Created MediaRecorder",
      this.mediaRecorder,
      "with options",
      options
    );
    this.recordButton.textContent = "Stop Recording";
    this.playButton.disabled = true;
    this.downloadButton.disabled = true;
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    this.mediaRecorder.start(10); // collect 10ms of data
    console.log("MediaRecorder started", this.mediaRecorder);
  }

  /**
   * Stop recording.
   */
  stopRecording() {
    this.mediaRecorder.stop();
    console.log("Recorded Blobs: ", this.recordedBlobs);
    this.recordedVideo.controls = true;
  }

  /**
   * Play by insert the recorded blobs, populated on handleDataAvailable to the video element src.
   */
  play() {
    const superBuffer = new Blob(this.recordedBlobs, { type: "video/webm" });
    this.recordedVideo.src = window.URL.createObjectURL(superBuffer);
  }

  /**
   * Download by putting the recorder blobs populated on handleDataAvailable as data link.
   */
  download() {
    const blob = new Blob(this.recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

new Recorder(); // Init class constructor.
