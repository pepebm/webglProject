var camera,
  scene,
  raycaster,
  renderer,
  controls,
  instructions,
  delta,
  time,
  prevTime = performance.now();

var moveForward = false,
    moveBackward = false,
    moveRight = false,
    moveLeft = false,
    velocity,
    direction;
function run() {
  requestAnimationFrame(run);
  time = performance.now();
  delta = (time - prevTime) / 1000;
  handleMovement(delta);
  renderer.render(scene, camera);
}

function initPointerLock() {
  var havePointerLock = 'pointerLockElement' in document ||
                        'mozPointerLockElement' in document ||
                        'webkitPointerLockElement' in document;

  if (havePointerLock) {
    var element = document.body;
    var pointerlockchange = function(event) {
      if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        controls.enabled = true;
      } else {
        controls.enabled = false;
        instructions.style.display = '';
      }
    };
    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
    instructions.addEventListener('click', function(event) {
      instructions.style.display = 'none';
      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    }, false);
  } else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }
}

function createScene(canvas) {
  renderer = new THREE.WebGLRenderer( {canvas: canvas, antialias: true} );

  // Set the viewport size
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(70,
                                      window.innerWidth / window.innerHeight,
                                      1,
                                      10000
                                    );


  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  raycaster = new THREE.Raycaster();

  renderer.setPixelRatio(window.devicePixelRatio);
  instructions = document.getElementById('instructions');

  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  createMap();
}

function createMap() {
  let textures = {
    floor: "../resources/textures/floor1.jpeg",
    ceil: "../resources/textures/floor1.jpeg",
    walls: "../resources/textures/floor3.jpg",
    door: "../resources/textures/door.png"
  };
  mapCreatorObject.loadMaterials(textures);
  mapCreatorObject.randomize({
    doors_count: 2,
    door_rand_max: 2
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
