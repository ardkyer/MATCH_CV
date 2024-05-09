const video = document.getElementById('video');
startVideo();
Promise.all([
faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/tiny\_face\_detector\_model'),
faceapi.nets.faceLandmark68Net.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_landmark\_68\_model'),
faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_recognition\_model'),
faceapi.nets.faceExpressionNet.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_expression\_model')
])
.then(startVideo)
.catch((error) => {
console.error('Error loading models:', error);
});
function startVideo() {
navigator.getUserMedia(
{ video: {} },
stream => video.srcObject = stream,
err => console.error(err)
);
}
video.addEventListener('play', () => {
const canvas = faceapi.createCanvasFromMedia(video);
document.body.append(canvas);
const displaySize = { width: video.width, height: video.height };
faceapi.matchDimensions(canvas, displaySize);
const detectFaces = async () => {
if (video.paused || video.ended) {
return;
}
const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
if (video.width > 0 && video.height > 0) {
const resizedDetections = faceapi.resizeResults(detections, displaySize);
canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
faceapi.draw.drawDetections(canvas, resizedDetections);
faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
}
requestAnimationFrame(detectFaces);
};
detectFaces();
});
