const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/labor/face-api/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/labor/face-api/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/labor/face-api/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/labor/face-api/models')
]).then(startVideo);

function startVideo(){
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

video.addEventListener('play', ()=>{
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    start = setInterval(async ()=>{
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        if(detections[0]){
            if(detections[0].expressions.happy > 0.80 && detections[0].expressions.happy < 1.1){
                if(document.querySelector('face-result')){ document.querySelector('face-result').outerHTML = '' }
                var result = document.createElement('face-result');
                result.innerHTML = `
                    <h1>Você sorriu! Perdeu o jogo do sério... KKKKKK</h1>
                    <button type="button" onclick="document.querySelector('face-result').outerHTML = '';">OK</button>
                `;
                document.body.append(result);
            }
        }
    }, 100);
});