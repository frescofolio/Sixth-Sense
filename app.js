const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const mensaje = document.getElementById('mensaje');

const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true; // Crucial para que no se abra en pantalla completa nativa en iOS

let modoActual = 'normal';

// Forzar la cámara trasera en dispositivos móviles usando 'environment'
const opcionesCamara = {
    video: {
        facingMode: 'environment', // 'environment' = Cámara trasera, 'user' = frontal
        width: { ideal: 640 },
        height: { ideal: 480 }
    },
    audio: false
};

navigator.mediaDevices.getUserMedia(opcionesCamara)
    .then(stream => {
        video.srcObject = stream;
        mensaje.innerText = "¡Cámara lista! Toca la pantalla para activar los efectos.";
    })
    .catch(err => {
        mensaje.innerText = "Error: Por favor otorga permisos para usar la cámara.";
        console.error(err);
    });

video.addEventListener('loadedmetadata', () => {
    // Definimos una resolución base óptima para procesadores móviles
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
});

// Arrancar al primer toque en la pantalla del celular
document.addEventListener('click', () => {
    if (video.srcObject) {
        video.play().then(() => {
            mensaje.style.display = 'none';
            buclePrincipal();
        });
    }
});

function cambiarModo(nuevoModo) {
    modoActual = nuevoModo;
    document.querySelectorAll('#consola button').forEach(btn => btn.classList.remove('activo'));
    document.getElementById(`btn-${nuevoModo}`).classList.add('activo');
}

function buclePrincipal() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (modoActual === 'efecto') {
        aplicarEfectoTD();
    } else if (modoActual === 'objetos') {
        simularEscanerDatos();
    }

    requestAnimationFrame(buclePrincipal);
}

function aplicarEfectoTD() {
    const datosImagen = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixeles = datosImagen.data;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tiempo = Date.now() * 0.002;
    const tamanoBloque = 10; // Bloques un poco más grandes para suavizar el rendimiento móvil

    for (let y = 0; y < canvas.height; y += tamanoBloque) {
        for (let x = 0; x < canvas.width; x += tamanoBloque) {
            let desviox = Math.floor(Math.sin(y * 0.02 + tiempo) * 12);
            let targetX = Math.min(Math.max(x + desviox, 0), canvas.width - 1);
            let indice = (targetX + y * canvas.width) * 4;
            
            let r = pixeles[indice];
            let g = pixeles[indice + 1];
            let b = pixeles[indice + 2];
            
            if (r !== undefined) {
                ctx.fillStyle = `rgb(${r}, ${255 - g}, ${Math.floor(b * Math.abs(Math.sin(tiempo)))})`;
                ctx.fillRect(x, y, tamanoBloque - 1, tamanoBloque - 1);
            }
        }
    }
}

function simularEscanerDatos() {
    const datosImagen = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixeles = datosImagen.data;
    const tiempo = Date.now();

    // Rejilla HUD
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.12)';
    ctx.lineWidth = 1;
    let saltoGrid = 40;
    for (let x = 0; x < canvas.width; x += saltoGrid) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += saltoGrid) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    let puntosDetectados = 0;
    let densidadMuestreo = 35;

    for (let y = 40; y < canvas.height - 40; y += densidadMuestreo) {
        for (let x = 40; x < canvas.width - 40; x += densidadMuestreo) {
            let pixelX = Math.floor(x);
            let pixelY = Math.floor(y);
            let indice = (pixelX + pixelY * canvas.width) * 4;
            
            let r = pixeles[indice];
            let g = pixeles[indice + 1];
            let b = pixeles[indice + 2];
            
            if (r === undefined) continue;

            let brillo = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            if (brillo > 140 && puntosDetectados < 4) { // Limitado a 4 miras para optimizar batería móvil
                puntosDetectados++;
                
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(pixelX, pixelY, 15 + Math.sin(tiempo * 0.01) * 2, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(pixelX - 6, pixelY); ctx.lineTo(pixelX + 6, pixelY);
                ctx.moveTo(pixelX, pixelY - 6); ctx.lineTo(pixelX, pixelY + 6);
                ctx.stroke();

                ctx.fillStyle = '#00ffcc';
                ctx.font = '10px sans-serif';
                ctx.fillText(`TRK:${pixelX},${pixelY}`, pixelX + 22, pixelY + 2);
            }
        }
    }

    // Mini panel móvil
    ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
    ctx.fillRect(15, 15, 180, 55);
    ctx.strokeStyle = '#00ffcc';
    ctx.strokeRect(15, 15, 180, 55);

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText("» MOBILE CHOP ANALYTICS", 22, 30);
    ctx.font = '8px sans-serif';
    ctx.fillText(`TARGETS: ${puntosDetectados} DETECTED`, 22, 45);
}
