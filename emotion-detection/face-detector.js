import * as faceapi from "face-api.js";

const video = document.createElement("video");
video.width = 320;
video.height = 240;
document.body.appendChild(video);

const canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;
canvas.id = "overlay";
document.body.appendChild(canvas);

const emotion = document.createElement("p");
emotion.id = "emotion";
emotion.innerText = "Detecting...";
document.body.appendChild(emotion);

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]);
  startVideo();
}

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing camera: ", err);
  }
}

video.addEventListener("play", () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      const topEmotion = Object.entries(detection.expressions)
        .sort((a, b) => b[1] - a[1])[0][0];

      emotion.innerText = "Current Emotion: " + topEmotion;
      window.currentEmotion = topEmotion;
    }
  }, 800);
});

loadModels();