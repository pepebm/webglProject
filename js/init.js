var camera,
  scene,
  raycaster,
  renderer,
  controls,
  instructions;

function run() {
  requestAnimationFrame(run);
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

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  raycaster = new THREE.Raycaster();

  renderer.setPixelRatio(window.devicePixelRatio);
  instructions = document.getElementById('instructions');

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown, false);


  createMap();
}

function createMap() {
  if(!materials.initialized){
    loadMaterials({
      floor: "../resources/textures/floor1.jpeg",
      ceil: "../resources/textures/floor1.jpeg",
      walls: "../resources/textures/floor3.jpg",
    });
  }
  createHallway(scene, 50);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
