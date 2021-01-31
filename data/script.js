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
  trans: ["#55CDFC", "#F7A8B8", "#FFFFFF", "#F7A8B8", "#55CDFC"],
  straight: ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"]
};

const intensity = parseFloat(getQueryVariable("intensity") || "1");
const flag = getQueryVariable("flag") || "gay";
const colours = getQueryVariable("colour", true) || getQueryVariable("color", true) || flags[flag] || flags["gay"];
const ctx = document.createElement("canvas").getContext("2d");
ctx.canvas.width = 1920;
ctx.canvas.height = 1080;
const rowHeight = ctx.canvas.height / colours.length;
for (var i = 0; i < colours.length; i++) {
  ctx.fillStyle = colours[i];
  ctx.fillRect(0, i*rowHeight, ctx.canvas.width, (i+1)*rowHeight);
}

var started = false, paused = false;
var elapsedTime = -1;
var centerX, centerY;
const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({antialias: true});
const plane = new THREE.PlaneGeometry(5, 3, 50, 30);
const material = new THREE.MeshPhongMaterial({map: loader.load(ctx.canvas.toDataURL())});
const flagMesh = new THREE.Mesh(plane, material);
scene.add(flagMesh);

const backlight = new THREE.SpotLight(0xFFFFFF, 2);
backlight.position.set(-5, 0, 1.5);
backlight.penumbra = 1;

const clock = new THREE.Clock({autostart: false});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("name").innerHTML = getQueryVariable("name") || "Someone out there";
  document.getElementById("gay").innerHTML = (getQueryVariable("text") || flag).toUpperCase();
  start();
  renderer.domElement.id = "pride_flag";
  document.body.appendChild(renderer.domElement);
  setup();
});

window.addEventListener('resize', function() {
  setup();
});

document.addEventListener('visibilitychange', function (e) {
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

document.addEventListener('mousemove', function (e) {
  var angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) + Math.PI;
  backlight.position.set(-Math.cos(angle) * 5, Math.sin(angle) * 3.5, 1.5);
});

document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    schedAnimVarChange(x => backlight.angle += x, () => clampDelta(backlight.angle, e.deltaY > 0 ?  -Math.PI / 56 : Math.PI / 56, Math.PI/6, Math.PI/2), 25, () => backlight.angle = clamp(backlight.angle, Math.PI/6, Math.PI/2));
    e.preventDefault();
  } else schedAnimVarChange(x => backlight.intensity += x, () => clampDelta(backlight.intensity, e.deltaY > 0 ? -0.15 : 0.15, 1, 3), 25, () => backlight.intensity = clamp(backlight.intensity, 1, 3));
}, {passive: false});

function start() {
  AOS.init({once: true});
  started = true;
  clock.start();
}

function clampDelta(x, delta, min, max) {
  var clamped = clamp(x+delta, min, max);
  return delta < 0 && clamped > x+delta || clamped < x+delta ? clamped - x : delta;
}

function clamp(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

var ongoingVarAnim = false;
var varAnimQueue = [];

function schedAnimVarChange(adder, deltaGetter, time, onready) {
  if (!ongoingVarAnim) animVarChange(adder, deltaGetter, time, onready);
  else varAnimQueue.push({adder: adder, deltaGetter: deltaGetter, time: time, onready: onready});
}

function animVarChange(adder, deltaGetter, time, onready) {
  var delta = deltaGetter();
  if (delta == 0 || Math.abs(delta) < 0.1e-4) {
    if (varAnimQueue.length) {
        var entry = varAnimQueue.shift();
        animVarChange(entry.adder, entry.deltaGetter, entry.time, entry.onready);
      }
    return;
  }
  ongoingVarAnim = true;
  var step = delta / time;
  var total = 0;
  var start = adder(0);
  var end = start+delta;
  function add() {
    adder(step);
    total += step;
    if (Math.abs(total) < Math.abs(delta)) setTimeout(add, 1);
    else {
      adder(end-adder(0)); // Float-precision may mess with accuracy of end product, so we fix that here.
      if (onready) onready();
      ongoingVarAnim = false;
      if (varAnimQueue.length) {
        var entry = varAnimQueue.shift();
        animVarChange(entry.adder, entry.deltaGetter, entry.time, entry.onready);
      }
    }
  }
  add();
}

function setup() {
  renderer.width = renderer.domElement.width = window.innerWidth;
  renderer.height = renderer.domElement.height = window.innerHeight;
  camera.aspect = renderer.width / renderer.height;
  camera.fov = 2 * Math.atan(3 / (2 * (camera.position.z - flagMesh.position.z))) * (180 / Math.PI);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
  if (!backlight.parent) {
    var intensity = backlight.intensity;
    backlight.intensity = 0;
    scene.add(backlight);
    animVarChange(x => backlight.intensity += x, () => intensity, 250);
  }
}
setup();

function animate() {
  if (started && !paused) {
    const t = clock.getElapsedTime();

    // Background flag wave
    var pos = flagMesh.geometry.attributes.position;
    for (var i = 0; i < pos.array.length; i += 3) {
      const waveX1 = 0.75 * Math.sin(pos.array[i] * 2 + t * 3 + pos.array[i+1]);
      const waveX2 = 0.25 * Math.sin(pos.array[i] * 3 + t * 2 + pos.array[i+1]);
      const waveY1 = 0.1 * Math.sin(pos.array[i+1] * 5 + t * 0.5 + pos.array[i]);
      const multi = (pos.array[i] + 2.5) / 5*intensity;
      pos.array[i+2] = (waveX1 + waveX2 + waveY1) * multi;
    }
    pos.needsUpdate = true;
  }
  
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Thanks to https://www.superhi.com/library/posts/how-to-make-a-3d-waving-flag-using-three-js-webgl-and-javascript for quite a big part of the rendering of the flag.