// https://stackoverflow.com/a/2091331
function getQueryVariable(variable, raw) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var results = [];
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable)
        results.push(decodeURIComponent(pair[1]));
  }
  return results.length == 0 ? undefined : results.length == 1 && !raw ? results[0] : results;
}

var start;
const flags = {
  gay: ["#FF0018", "#FFA52C", "#FFFF41", "#008018", "#0000F9", "#86007D"],
  lesbian: ["#D62900", "#FF9B55", "#FFFFFF", "#D461A6", "#A50062"],
  bi: ["#D60270", "#9B4F96", "#0038A8"],
  trans: ["#55CDFC", "#FFFFFF", "#F7A8B8"],
  straight: ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"]
};

const intensity = parseFloat(getQueryVariable("intensity") || "1");
const flag = getQueryVariable("flag") || "gay";
const mine = flag.toLowerCase() == "mine";
const colours = getQueryVariable("colour", true) || getQueryVariable("color", true) || flags[flag] || flags["gay"];
const ctx = document.createElement("canvas").getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
const rowHeight = ctx.canvas.height / colours.length;
for (var i = 0; i < colours.length; i++) {
  ctx.fillStyle = colours[i];
  ctx.fillRect(0, i*rowHeight, ctx.canvas.width, (i+1)*rowHeight);
}

// https://threejs.org/docs/#api/en/geometries/ShapeGeometry
const heartShape = new THREE.Shape();
heartShape.moveTo(5, 5);
heartShape.bezierCurveTo(5, 5, 4, 0, 0, 0);
heartShape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
heartShape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
heartShape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
heartShape.bezierCurveTo(16, 7, 16, 0, 10, 0);
heartShape.bezierCurveTo(7, 0, 5, 5, 5, 5);

var started = false, paused = false;
var elapsedTime = -1;
const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({antialias: true});
const plane = new THREE.PlaneGeometry(5, 3, 50, 30);
const material = new THREE.MeshPhongMaterial({map: loader.load(ctx.canvas.toDataURL())});
const flagMesh = new THREE.Mesh(plane, material);
if (!mine) scene.add(flagMesh);

const heartGeometry = new THREE.ShapeGeometry(heartShape);
heartGeometry.scale(0.075, 0.075, 0.075);
heartGeometry.rotateZ(Math.PI);
const heartMaterial = new THREE.MeshBasicMaterial({color: 0xE31B23});
const heartMesh1 = new THREE.Mesh(heartGeometry, heartMaterial);
heartMesh1.position.set(-1.5, 0, 0);
const heartMesh2 = heartMesh1.clone();
heartMesh2.position.set(2.2, 1, 0);

const habbiMaterial = new THREE.SpriteMaterial({map: loader.load("data/habbi.png"), color: 0xFFFFFF});
const habbiMesh = new THREE.Sprite(habbiMaterial);
habbiMesh.position.set(-1.2, 0.8, 0);
habbiMesh.material.rotation = 1.57 / -2;

const loveMaterial = new THREE.SpriteMaterial({map: loader.load("data/love.png"), color: 0xFFFFFF});
const loveMesh = new THREE.Sprite(loveMaterial);
loveMesh.position.set(2, -1, 0);
loveMesh.material.rotation = habbiMesh.material.rotation + 0.24/2;

if (mine) {
  scene.add(heartMesh1);
  scene.add(heartMesh2);
  scene.add(habbiMesh);
  scene.add(loveMesh);
}

const leftLight = new THREE.SpotLight(0xFFFFFF, 2);
leftLight.position.set(-5, 0, 1.5);
scene.add(leftLight);
const clock = new THREE.Clock({autostart: false});

var hearts = [];
const smallHeartGeometry = new THREE.ShapeGeometry(heartShape);
smallHeartGeometry.scale(0.0075, 0.0075, 0.0075);
smallHeartGeometry.rotateZ(Math.PI);
const smallHeartMesh = new THREE.Mesh(smallHeartGeometry, heartMaterial);

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("name").innerHTML = (getQueryVariable("name") || "Someone out there");
  document.getElementById("gay").innerHTML = (mine ? "mine" : getQueryVariable("text") || flag).toUpperCase();
  if (mine) {
    var h1 = document.getElementsByTagName("h1")[0], h2 = document.getElementsByTagName("h2")[0], h3 = document.getElementsByTagName("h3")[0], h4 = document.getElementsByTagName("h4")[0], climax = document.getElementsByTagName("h1")[1];
    h1.innerHTML = "I just";
    h2.innerHTML = "had to";
    h2.style.transitionDelay = "700ms";
    h3.innerHTML = "let you";
    h3.style.transitionDelay = "1550ms";
    h4.innerHTML = "know you're";
    h4.style.transitionDelay = "2200ms";
    climax.style.transitionDelay = "3300ms";
    var audio = document.getElementById("mine");
    audio.volume = 0.2;
    audio.play().then(val => start()).catch(err => {
      var temp = document.createElement("h1");
      temp.innerHTML = "CLICK TO START";
      temp.style = "width: 100%; text-align: center;";
      document.getElementById("content").appendChild(temp);
      h1.style.display = h2.style.display = h3.style.display = h4.style.display = climax.style.display = renderer.domElement.style.display = "none";
      var func = function () {
        temp.parentElement.removeChild(temp);
        h1.style.display = h2.style.display = h3.style.display = h4.style.display = climax.style.display = renderer.domElement.style.display = null;
        start();
        audio.play();
        document.removeEventListener('click', func);
      };
      document.addEventListener('click', func);
    });
  } else start();
  renderer.domElement.id = "pride_flag";
  document.body.appendChild(renderer.domElement);
  setup();
});

window.addEventListener('resize', function() {
  setup();
});

document.addEventListener('visibilitychange', function(ev) {
  if (document.visibilityState == "visible") {
    if (started) {
      clock.start();
      clock.elapsedTime = elapsedTime; // To make sure it continues where it left off.
      paused = false;
    }
  } else {
    paused = true;
    elapsedTime = clock.getElapsedTime();
    clock.stop();
  }
});

function start() {
  AOS.init({once: true});
  if (!started) setInterval(rotateEmojis, 15);
  started = true;
  clock.start();
}

function setup() {
  renderer.width = renderer.domElement.width = window.innerWidth;
  renderer.height = renderer.domElement.height = window.innerHeight;
  camera.aspect = renderer.width / renderer.height;
  let dist = camera.position.z - flagMesh.position.z;
  let height = 3;
  camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
setup();

function invert(i, x) {
  i %= 2*x;
  return i < x ? i : x - (i - x);
}

var rotateCount = 0;

function rotateEmojis() {
  if (!paused) {
    const t = clock.getElapsedTime();

    // Heart face rotation
    var tm = (rotateCount*15) % 1995;
    if (tm < lastupdate1) direction1 = !direction1;
    lastupdate1 = tm;
    habbiMesh.material.rotation += (direction1 ? -1 : 1) * (tm / 2000 * Math.PI * 0.5) * (1 - tm/2000) * 0.05;

    // Heart eyes face rotation
    tm = ((rotateCount+33)*15) % 1995;
    if (tm < lastupdate2) direction2 = !direction2;
    lastupdate2 = tm;
    loveMesh.material.rotation += (direction2 ? -1 : 1) * (tm / 2000 * Math.PI * 0.5) * (1 - tm/2000) * 0.05;
    
    rotateCount++;
  }
}

const update = (t, premulti) => v => {
  const waveX1 = 0.75 * Math.sin(v.x * 2 + t * 3 + v.y);
  const waveX2 = 0.25 * Math.sin(v.x * 3 + t * 2 + v.y);
  const waveY1 = 0.1 * Math.sin(v.y * 5 + t * 0.5 + v.x);
  const multi = premulti || (v.x + 2.5) / 5*intensity;
  v.z = (waveX1 + waveX2 + waveY1) * multi;
};

var lastupdate1 = -1, lastupdate2 = -1;
var direction1 = false, direction2 = false;
var lastSH = -1;

function animate() {
  if (started && !paused) {
    const t = clock.getElapsedTime();

    // Background flag wave
    flagMesh.geometry.vertices.map(update(t));
    flagMesh.geometry.verticesNeedUpdate = true;

    // Hearts wave
    heartGeometry.vertices.map(update(t, 0.2));
    heartGeometry.verticesNeedUpdate = true;

    // Small background hearts creation
    if (t - lastSH >= 0.1 && mine) {
      lastSH = t;
      var sh = smallHeartMesh.clone();
      sh.geometry = smallHeartGeometry.clone();
      var shm = heartMaterial.clone();
      shm.color.add(new THREE.Color((Math.random()-0.5) / 5, (Math.random()-0.5) / 5, (Math.random()-0.5) / 2));
      sh.material = shm;
      sh.position.set((Math.random()-0.5) * 20, -2.1, -2);
      hearts.push([sh, (Math.random()+1) * 0.5, t]);
      scene.add(sh);
    }

    // Small background hearts updating
    let heartsToDelete = [];
    hearts.forEach(heartData => {
      var heart = heartData[0];
      var speed = heartData[1];
      var creationTime = heartData[2];
      if (heart.position.y >= 2.25) heartsToDelete.push(heartData);
      else {
        heart.position.y += 0.01 * speed;
        var max = 0;
        const midY = (0.075*-1.9) / 2; // The highest vertice in the heart seems to be at -0.1425 which 'coincidentally' is -1.9 multiplied by the scale (0.075). Negative because it's rotated 180°, 1.9 because that's a tenth of the highest y-value used when defining the shape.
        var ti = invert((t-creationTime)%0.5, 0.25);
        heart.geometry.vertices.map(v => {
          v.z = Math.sin(ti - 0.125) * (v.y - midY) * 4 * speed;
        });
        var x = (ti - 0.125) * 0.5 * (speed*0.5 + 0.5);
        heart.position.x += (x ** 2) * (x < 0 ? -1 : 1);
        heart.geometry.verticesNeedUpdate = true;
      }
    });
    
    // Small background hearts removal
    heartsToDelete.forEach(pair => {
      hearts.splice(hearts.indexOf(pair), 1);
      pair[0].geometry.dispose();
      pair[0].material.dispose();
      scene.remove(pair[0]);
    });
  }
  
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Thanks to https://www.superhi.com/library/posts/how-to-make-a-3d-waving-flag-using-three-js-webgl-and-javascript for quite a big part of the rendering of the flag.