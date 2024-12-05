const video = document.getElementById('video');
const status = document.getElementById('status');

// Función para manejar el acceso a la cámara de manera más robusta
function setupCamera() {
    // Verificar compatibilidad con getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia no es compatible con este navegador.");
        status.textContent = "Tu navegador no es compatible con la cámara.";
        return;
    }

    // Configurar restricciones de video
    const constraints = {
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user" // Preferir la cámara frontal
        }
    };

    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            console.log("Stream de cámara obtenido con éxito");
            video.srcObject = stream;

            // Esperar a que el video esté listo
            video.onloadedmetadata = () => {
                video.play();
                startDetection();
            };
        })
        .catch(err => {
            console.error("Error detallado al acceder a la cámara:", err);
            status.textContent = `No se puede acceder a la cámara: ${err.message}`;
        });
}

// Capturar un frame del video
function captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
}

// Iniciar la detección de rostros
function startDetection() {
    setInterval(() => {
        const frameData = captureFrame();
        const formData = new FormData();
        formData.append('frame', dataURItoBlob(frameData));

        // Usar URL completa para compatibilidad entre localhost y red local
        fetch(`${window.location.origin}/detect`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            status.textContent = data.message;
        })
        .catch(err => {
            console.error("Error en la detección:", err);
            status.textContent = "Error en la detección de rostros";
        });
    }, 1000); // Detectar cada segundo
}

// Convertir Data URI a Blob
function dataURItoBlob(dataURI) {
    // Dividir el Data URI en metadatos y datos
    const splitDataURI = dataURI.split(',');
    const byteString = atob(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    // Crear un ArrayBuffer y Uint8Array
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Crear y devolver un Blob
    return new Blob([uint8Array], { type: mimeString });
}

// Iniciar configuración de la cámara cuando el documento esté listo
document.addEventListener('DOMContentLoaded', setupCamera);