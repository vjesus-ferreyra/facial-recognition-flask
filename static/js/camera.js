const video = document.getElementById('video');
const status = document.getElementById('status');

// Acceder a la cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
        startDetection();
    })
    .catch(err => console.error("Error al acceder a la cámara:", err));

function captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
}

function startDetection() {
    setInterval(() => {
        const frameData = captureFrame();
        const formData = new FormData();
        formData.append('frame', dataURItoBlob(frameData));

        fetch('/detect', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            status.textContent = data.message;
        })
        .catch(err => console.error("Error:", err));
    }, 1000); // Detectar cada segundo
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mimeString });
}
