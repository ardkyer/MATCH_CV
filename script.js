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
  loadModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/tiny_face_detector_model-weights_manifest.json'),
  loadModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_landmark_68_model-weights_manifest.json'),
  loadModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_recognition_model-weights_manifest.json'),
  loadModel('https://raw.githubusercontent.com/ardkyer/MATCH_CV/main/models/face_expression_model-weights_manifest.json')
]).then(([tinyFaceDetectorModel, faceLandmark68NetModel, faceRecognitionNetModel, faceExpressionNetModel]) => {
  faceapi.nets.tinyFaceDetector.load(tinyFaceDetectorModel);
  faceapi.nets.faceLandmark68Net.load(faceLandmark68NetModel);
  faceapi.nets.faceRecognitionNet.load(faceRecognitionNetModel);
  faceapi.nets.faceExpressionNet.load(faceExpressionNetModel);
  startVideo();
}).catch((error) => {
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

