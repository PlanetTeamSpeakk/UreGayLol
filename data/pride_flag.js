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
const heartMaterial = new THREE.MeshBasicMaterial({color: 0xFF4400});
const heartMesh1 = new THREE.Mesh(heartGeometry, heartMaterial);
heartMesh1.position.set(-1.5, 0, 0);
const heartMesh2 = new THREE.Mesh(heartGeometry, heartMaterial);
heartMesh2.position.set(2.2, 1, 0);
if (mine) {
  scene.add(heartMesh1);
  scene.add(heartMesh2);
  
  const habbiMaterial = new THREE.SpriteMaterial({map: loader.load("data/habbi.png"), color: 0xFFFFFF});
  const habbiMesh = new THREE.Sprite(habbiMaterial);
  habbiMesh.position.set(-1.2, 0.8, 0);
  scene.add(habbiMesh);

  const loveMaterial = new THREE.SpriteMaterial({map: loader.load("data/love.png"), color: 0xFFFFFF});
  const loveMesh = new THREE.Sprite(loveMaterial);
  loveMesh.position.set(2, -1, 0);
  scene.add(loveMesh);
}

const leftLight = new THREE.SpotLight(0xFFFFFF, 2);
leftLight.position.set(-5, 0, 1.5);
scene.add(leftLight);
const clock = new THREE.Clock()

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("name").innerHTML = (getQueryVariable("name") || "Someone out there");
  document.getElementById("gay").innerHTML = (getQueryVariable("text") || flag).toUpperCase();
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
    audio.play();
  }
  renderer.domElement.id = "pride_flag";
  document.body.appendChild(renderer.domElement);
  setup();
});

window.addEventListener('resize', function() {
  setup();
});

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

const update = (t, premulti) => v => {
  const waveX1 = 0.75 * Math.sin(v.x * 2 + t * 3 + v.y);
  const waveX2 = 0.25 * Math.sin(v.x * 3 + t * 2 + v.y);
  const waveY1 = 0.1 * Math.sin(v.y * 5 + t * 0.5 + v.x);
  const multi = premulti || (v.x + 2.5) / 5*intensity;
  v.z = (waveX1 + waveX2 + waveY1) * multi;
};

function animate() {
  const t = clock.getElapsedTime();
  flagMesh.geometry.vertices.map(update(t));
  flagMesh.geometry.verticesNeedUpdate = true;
  heartMesh1.geometry.vertices.map(update(t, 0.2));
  heartMesh1.geometry.verticesNeedUpdate = true;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Thanks to https://www.superhi.com/library/posts/how-to-make-a-3d-waving-flag-using-three-js-webgl-and-javascript for quite a big part of the rendering of the flag.