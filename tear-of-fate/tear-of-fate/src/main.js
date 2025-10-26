import Scene2 from "./scenes/Scene2.js";
import Scene1 from "./scenes/Scene1.js";
import MainMenu from "./scenes/MainMenuScene.js";
import * as faceapi from "face-api.js";

// Phaser
const width = window.innerWidth;
const height = window.innerHeight;

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    backgroundColor: '#222',
    scene: [MainMenu, Scene2, Scene1],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

new Phaser.Game(config);

const canvas = document.createElement("canvas");
canvas.id = "overlay";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = 20;        
document.body.appendChild(canvas);


// Face-api
const video = document.createElement("video");
video.width = 320;
video.height = 240;
video.style.position = "absolute";
video.style.top = "10px";
video.style.left = "10px";
video.style.width = "160px";   
video.style.height = "120px";
video.style.border = "2px solid white";
video.style.zIndex = 10;       
document.body.appendChild(video);


const emotion = document.createElement("p");
emotion.id = "emotion";
emotion.style.position = "absolute";
emotion.style.top = "10px";      
emotion.style.left = "10px";
emotion.style.color = "white";
emotion.style.fontFamily = "sans-serif";
emotion.style.fontSize = "16px";
emotion.style.zIndex = 30;      
document.body.appendChild(emotion);


async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
  ]);
  startVideo();
}

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("Stream attached: ", video.srcObject);
    video.play().catch(err => console.error("Video play failed:", err));
      } catch (err) {
    console.error("Error accessing camera: ", err);
  }
}

video.addEventListener("play", () => {
  canvas.width = video.width;
  canvas.height = video.height;

  canvas.style.width = video.style.width; 
  canvas.style.height = video.style.height; 
  canvas.style.top = video.style.top;
  canvas.style.left = video.style.left;

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceExpressions();
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);

      const topEmotion = Object.entries(detection.expressions)
        .sort((a, b) => b[1] - a[1])[0][0];

      emotion.innerText = "Current Emotion: " + topEmotion;
      emotion.style.top = "140px"; 
      emotion.style.left = "10px";
      window.currentEmotion = topEmotion;
      
    }
  }, 800);
});

loadModels();