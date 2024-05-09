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
  faceapi.nets.tinyFaceDetector.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/tiny_face_detector_model-shard1'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_landmark_68_model-shard1'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_recognition_model-shard1'),
  faceapi.nets.faceRecognitionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_recognition_model-shard2'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://ardkyer.github.io/MATCH_CV/models/face_expression_model-shard1')
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
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new
            faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
            .withFaceExpressions()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
})

