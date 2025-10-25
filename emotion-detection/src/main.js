let cameraX = 0;
let playerX = 0; // player position (world pixels)

// Background slideshow images (keeps original first image then joybackground)
const bgImages = [
  '/src/level1/background/backgroud.png', // original as in HTML (note: spelling preserved)
  '/src/level1/background/background.png'
];
let loadedBgImages = []; // resolved image URLs (fall back to inline SVG if missing)
let bgIndex = 0; // which image is currently active on the body

// Create a top-layer full-screen div used to crossfade between backgrounds.
const bgFade = document.createElement('div');
bgFade.id = 'bg-fade-overlay';
Object.assign(bgFade.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  backgroundRepeat: 'repeat',
  backgroundPosition: 'center',
  backgroundSize: '150% 150%',
  opacity: '0',
  transition: 'opacity 0.6s ease',
  zIndex: '0' // should be behind UI overlays like video (video uses z-index:1 in HTML)
});
document.body.appendChild(bgFade);

function makeFallbackSVG(isJoy = false) {
  const svg = isJoy ? 
    `<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'>
      <defs>
        <linearGradient id='sky' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stop-color='#87CEEB'/>
          <stop offset='100%' stop-color='#E0F7FA'/>
        </linearGradient>
        <filter id='cloudBlur' x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur in='SourceGraphic' stdDeviation='5'/>
        </filter>
      </defs>
      <rect width='100%' height='100%' fill='url(#sky)'/>
      <g filter='url(#cloudBlur)'>
        <ellipse cx='300' cy='200' rx='100' ry='60' fill='white'/>
        <ellipse cx='800' cy='300' rx='120' ry='70' fill='white'/>
        <ellipse cx='1200' cy='150' rx='90' ry='50' fill='white'/>
        <ellipse cx='1600' cy='250' rx='110' ry='65' fill='white'/>
      </g>
      <path d='M960,600 C860,600 780,500 800,400 C700,400 600,300 700,200 C800,100 900,150 1000,200 C1100,100 1200,150 1220,250 C1320,200 1420,300 1320,400 C1340,500 1260,600 1160,600 Z' fill='#FFD700' stroke='#FFA500' stroke-width='3'/>
      <circle cx='960' cy='540' r='200' fill='#FFD700' stroke='#FFA500' stroke-width='3'/>
    </svg>` :
    `<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'>
      <defs>
        <linearGradient id='sky' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stop-color='#1a237e'/>
          <stop offset='100%' stop-color='#3949ab'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#sky)'/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(makeFallbackSVG(src.includes('joybackground')));
    img.src = src;
  });
}

// preload all images and replace any missing ones with a generated inline SVG data URL
Promise.all(bgImages.map(preloadImage)).then((results) => {
  loadedBgImages = results;
  // If the HTML already set a body background, we'll remove it and use the sliding layers
  // to avoid double-drawing. The slider will take over rendering the backgrounds.
  document.body.style.backgroundImage = 'none';
  createSlidingBackground(loadedBgImages);
});

// Create two side-by-side full-screen backgrounds and slide them based on playerX.
function createSlidingBackground(images) {
  const len = Math.max(images.length, 1);
  // wrapper holds two full-screen panels side-by-side
  const wrap = document.createElement('div');
  wrap.id = 'bg-slider-wrap';
  Object.assign(wrap.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '200vw',
    height: '100vh',
    display: 'flex',
    transition: 'transform 0s linear',
    willChange: 'transform',
    zIndex: '0',
    pointerEvents: 'none',
    overflow: 'hidden'
  });

  const a = document.createElement('div');
  const b = document.createElement('div');
  [a, b].forEach((el) => {
    Object.assign(el.style, {
      width: '100vw',
      height: '100vh',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '150% 150%',
      flex: '0 0 100vw'
    });
  });

  wrap.appendChild(a);
  wrap.appendChild(b);
  document.body.appendChild(wrap);

  // initial assignment
  let idxA = 0;
  a.style.backgroundImage = `url('${images[0 % len]}')`;
  b.style.backgroundImage = `url('${images[1 % len]}')`;

  function updateVisuals() {
    const screenW = Math.max(window.innerWidth, 1);
    // local offset into current panel
    let local = playerX % screenW;
    if (local < 0) local += screenW; // normalize negative
    wrap.style.transform = `translateX(-${local}px)`;

    // rotate panels when crossing full screen boundaries
    while (playerX >= screenW) {
      playerX -= screenW;
      // shift panels forward: A becomes previous B, B becomes next image
      idxA = (idxA + 1) % len;
      a.style.backgroundImage = `url('${images[idxA % len]}')`;
      b.style.backgroundImage = `url('${images[(idxA + 1) % len]}')`;
      // ensure transform matches new local (already adjusted)
      local = playerX % screenW;
      wrap.style.transform = `translateX(-${local}px)`;
    }

    while (playerX < 0) {
      // moving backward
      playerX += screenW;
      idxA = (idxA - 1 + len) % len;
      a.style.backgroundImage = `url('${images[idxA % len]}')`;
      b.style.backgroundImage = `url('${images[(idxA + 1) % len]}')`;
      const local2 = playerX % screenW;
      wrap.style.transform = `translateX(-${local2}px)`;
    }
  }

  // integrate with existing camera/parallax update loop by tapping into requestAnimationFrame
  function tick() {
    const bg = document.querySelector('.sky');
    cameraX = -playerX * 0.5;
    if (bg) bg.style.backgroundPosition = `${cameraX}px 0`;
    updateVisuals();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// keyboard movement (left/right arrows control playerX)
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') playerX += 40; // move faster for visible effect
  if (e.key === 'ArrowLeft') playerX = Math.max(-999999, playerX - 40);
});

// keep playerX within reasonable bounds on resize
window.addEventListener('resize', () => {
  playerX = Math.max(0, playerX);
});

function updateCamera() {
  // optional parallax effect for any element with class 'sky' (kept from previous code)
  const bg = document.querySelector('.sky');
  cameraX = -playerX * 0.5; // control how fast camera follows
  if (bg) bg.style.backgroundPosition = `${cameraX}px 0`;

  // determine which background should be visible based on playerX world position
  const screenW = Math.max(window.innerWidth, 1);
  const segment = Math.floor(playerX / screenW);
  // map segment to image index: segment 0 -> loadedBgImages[0], segment 1 -> loadedBgImages[1], etc.
  const imgsLen = Math.max(loadedBgImages.length, 1);
  const targetIndex = ((segment % imgsLen) + imgsLen) % imgsLen;
  if (loadedBgImages.length && targetIndex !== bgIndex) crossfadeTo(targetIndex);

  requestAnimationFrame(updateCamera);
}

updateCamera();

// keyboard movement (left/right arrows control playerX)
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') playerX += 40; // move faster for visible effect
  if (e.key === 'ArrowLeft') playerX = Math.max(0, playerX - 40);
});

// keep playerX within reasonable bounds on resize
window.addEventListener('resize', () => {
  playerX = Math.max(0, playerX);
});
