const video = document.getElementById('video');

Promise.all([
  faceapi.loadTinyFaceDetectorModel('https://raw.githubusercontent.com/ardkyer/MATCH\_CV/main/models/tiny\_face\_detector\_model-weights\_manifest.json'),
  faceapi.loadFaceLandmarkModel('https://raw.githubusercontent.com/ardkyer/MATCH\_CV/main/models/face\_landmark\_68\_model-weights\_manifest.json'),
  faceapi.loadFaceRecognitionModel('https://raw.githubusercontent.com/ardkyer/MATCH\_CV/main/models/face\_recognition\_model-weights\_manifest.json'),
  faceapi.loadFaceExpressionModel('https://raw.githubusercontent.com/ardkyer/MATCH\_CV/main/models/face\_expression\_model-weights\_manifest.json'),
  
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/tiny\_face\_detector\_model-shard1'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_landmark\_68\_model-shard1'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_recognition\_model-shard1'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_recognition\_model-shard2'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://ardkyer.github.io/MATCH\_CV/models/face\_expression\_model-shard1'),

  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/tiny_face_detector_model-shard1/tiny_face_detector_model-weights_manifest.json'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_landmark_68_model-shard1/face_landmark_68_model-weights_manifest.json'),
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_recognition_model-shard1/face_recognition_model-weights_manifest.json'),
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_recognition_model-shard2/face_recognition_model-weights_manifest.json'),
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_expression_model-shard1/face_expression_model-weights_manifest.json'),
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
