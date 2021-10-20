async function getConstraints() {
  const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  const video = {};

  if (supportedConstraints.width) {
    video.width = 1920;
  }
  if (supportedConstraints.height) {
    video.height = 1080;
  }
  if (supportedConstraints.deviceId) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const device = devices.find((device) => {
      return device.kind == "videoinput";
    });
    video.deviceId = device.deviceId;
  }

  return { video, audio: true };
}

async function getMedia() {
  const constraints = await getConstraints();
  const video = document.querySelector("video");
  const audio = document.querySelector("audio");
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log(stream, video.srcObject);
    video.srcObject = stream;
    audio.srcObject = stream;
    // use the stream
  } catch (err) {
    // handle the error - user's rejection or no media available
  }
}
getMedia();
