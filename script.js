const video = document.getElementById('video');

function loadModel(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Failed to load model: ' + url));
        }
      }
    };
    xhr.send();
  });
}

Promise.all([
  faceapi.loadTinyFaceDetectorModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/tiny_face_detector_model-weights_manifest.json'),
  faceapi.loadFaceLandmarkModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_landmark_68_model-weights_manifest.json'),
  faceapi.loadFaceRecognitionModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_recognition_model-weights_manifest.json'),
  faceapi.loadFaceExpressionModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_expression_model-weights_manifest.json'),
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

