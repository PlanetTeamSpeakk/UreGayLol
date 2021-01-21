// https://stackoverflow.com/a/2091331
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var results = [];
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable)
        results.push(decodeURIComponent(pair[1]));
  }
  return results.length == 0 ? undefined : results.length == 1 ? results[0] : results;
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
const colours = getQueryVariable("colour") || getQueryVariable("color") || flags[flag];
const ctx = document.createElement("canvas").getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
const rowHeight = ctx.canvas.height / colours.length;
for (var i = 0; i < colours.length; i++) {
  ctx.fillStyle = colours[i];
  ctx.fillRect(0, i*rowHeight, ctx.canvas.width, (i+1)*rowHeight);
}

const loader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
const plane = new THREE.PlaneGeometry(5, 3, 50, 30);
const material = new THREE.MeshPhongMaterial({
  map: loader.load(ctx.canvas.toDataURL())
});
const flagMesh = new THREE.Mesh(plane, material);
flagMesh.rotation.set(0, 0, 0);
scene.add(flagMesh);
const leftLight = new THREE.SpotLight(0xFFFFFF, 2);
leftLight.position.set(-5, 0, 1.5);
scene.add(leftLight);
const clock = new THREE.Clock()

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("name").innerHTML = (getQueryVariable("name") || "Someone out there");
  document.getElementById("gay").innerHTML = (getQueryVariable("text") || flag).toUpperCase();
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

function animate() {
  const t = clock.getElapsedTime();
  flagMesh.geometry.vertices.map(v => {
    const waveX1 = 0.75 * Math.sin(v.x * 2 + t * 3 + v.y);
    const waveX2 = 0.25 * Math.sin(v.x * 3 + t * 2 + v.y);
    const waveY1 = 0.1 * Math.sin(v.y * 5 + t * 0.5 + v.x);
    const multi = (v.x + 2.5) / 5*intensity;
    v.z = (waveX1 + waveX2 + waveY1) * multi;
  })
  flagMesh.geometry.verticesNeedUpdate = true;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Thanks to https://www.superhi.com/library/posts/how-to-make-a-3d-waving-flag-using-three-js-webgl-and-javascript for quite a big part of the rendering of the flag.