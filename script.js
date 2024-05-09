const video = document.getElementById('video');
const expressionOutput = document.getElementById('expression-output');

startVideo();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/tiny_face_detector_model'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_landmark_68_model'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_recognition_model'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_expression_model')
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
  const detectFaces = async () => {
    if (video.paused || video.ended) {
      return;
    }

    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
      const expressionValue = expressions[maxExpression].toFixed(2);
      expressionOutput.textContent = `${maxExpression} (${expressionValue})`;
    } else {
      expressionOutput.textContent = '';
    }

    requestAnimationFrame(detectFaces);
  };

  detectFaces();
});
