let miVideo;

function setup() {
  createCanvas(800, 600);
  pixelDensity(1);

  // Cargamos el video local
  miVideo = createVideo(['flordelirio.mp4']);
  miVideo.size(800, 600);
  miVideo.hide();
  miVideo.volume(0);
}

function draw() {
  // Cambiamos el fondo a ROJO brillante. 
  // Si la pantalla sigue negra, el problema es que el navegador no está leyendo este archivo.
  background(255, 0, 0); 

  miVideo.loadPixels();

  // Si el video ya tiene píxeles listos, dibujamos el efecto
  if (miVideo.pixels && miVideo.pixels.length > 0) {
    let tiempo = millis() * 0.002; 

    for (let y = 0; y < height; y += 10) { 
      for (let x = 0; x < width; x += 10) {
        let desviox = Math.floor(sin(y * 0.02 + tiempo) * 10);
        let targetX = constrain(x + desviox, 0, width - 1);
        let index = (targetX + y * width) * 4;
        
        let r = miVideo.pixels[index];
        let g = miVideo.pixels[index + 1];
        let b = miVideo.pixels[index + 2];
        
        if (r !== undefined) {
          fill(r, g, b);
          noStroke();
          rect(x, y, 10, 10);
        }
      }
    }
  } else {
    // Si el video no ha cargado, al menos veremos este texto sobre el fondo rojo
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Fondo activo. Haz CLIC para iniciar el video.", width / 2, height / 2);
  }
}

function mousePressed() {
  miVideo.play();
  miVideo.loop();
}
