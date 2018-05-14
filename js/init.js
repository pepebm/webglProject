var camera,
  scene,
  renderer,
  controls,
  instructions,
  delta,
  time,
  playerInGame = false,
  prevTime = performance.now();

let rayF,rayB,rayL,rayR;
let currentPos = null;
const raycasterFar = 4;

function run() {
  requestAnimationFrame(run);
  time = performance.now();
  delta = (time - prevTime) / 1000;
  if (controls.enabled) {
    let colitions = {
      nz: true,
      pz: true,
      nx: true,
      px: true
    }
    checkRaycasters(colitions);
    handleMovement(delta, colitions);
    mapCreatorObject.getParticlesGroup().tick(delta);
  }
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
        controls.enabled = true;
        if (currentPos != null) {
          scene.visible = false;
          scene.background.setRGB(0,0,0);
          setTimeout(() => {
            controls.getObject().position.copy(currentPos);
            scene.visible = true;
          }, 50);
        }
      } else {
        controls.enabled = false;
        currentPos = controls.getObject().position.clone();
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

  rayF = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, raycasterFar);
  rayB = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0, raycasterFar);
  rayL = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(-1, 0, 0), 0, raycasterFar);
  rayR = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0, raycasterFar);

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
  let paths = {
    floor: "../resources/textures/floor1.jpeg",
    ceil: "../resources/textures/floor1.jpeg",
    walls: "../resources/textures/floor3.jpg",
    door: "../resources/textures/door.png",
    fireParticles: "../resources/textures/sprite-flame2.jpg",
    torch: "../resources/obj/Torch/Torch.obj"
  };
  mapCreatorObject.loadMaterials(paths);
  mapCreatorObject.randomize({
    doors_count: 2,
    door_rand_max: 2
  });
}

function checkRaycasters(colitions) {
  let direction = controls.getDirection(camera.position);
  rayF.ray.direction.x = direction.x;
  rayF.ray.direction.z = direction.z;
  rayF.ray.origin.copy(controls.getObject().position);
  rayF.ray.origin.x += raycasterFar * rayF.ray.direction.x;
  rayF.ray.origin.z += raycasterFar * rayF.ray.direction.z;
  let intersections = rayF.intersectObjects(mapCreatorObject.getDoors());
  if (intersections.length) {
    colitions.nz = false;
    if (play) {
      play = false;
      function removeDoor(object) {
        mapCreatorObject.removeDoor(object);
        if (mapCreatorObject.getDoors().length == 0) {
          console.log("YOU WON");
        }
      }
      createMiniGame(removeDoor.bind(undefined, intersections[0].object));
    }
  }
  intersections = rayF.intersectObjects(mapCreatorObject.getWalls());
  if (intersections.length) {
    colitions.nz = false;
  }
  rayB.ray.direction.x = -direction.x;
  rayB.ray.direction.z = -direction.z;
  rayB.ray.origin.copy(controls.getObject().position);
  rayB.ray.origin.x += raycasterFar * rayB.ray.direction.x;
  rayB.ray.origin.z += raycasterFar * rayB.ray.direction.z;
  intersections = rayB.intersectObjects(mapCreatorObject.getDoors());
  if (intersections.length) {
    colitions.pz = false;
  }
  intersections = rayB.intersectObjects(mapCreatorObject.getWalls());
  if (intersections.length) {
    colitions.pz = false;
  }
  rayL.ray.direction.x = -(Math.cos(Math.PI / 2) * direction.x - Math.sin(Math.PI / 2) * direction.z);
  rayL.ray.direction.z = -(Math.sin(Math.PI / 2) * direction.x + Math.cos(Math.PI / 2) * direction.z);
  rayL.ray.origin.copy(controls.getObject().position);
  rayL.ray.origin.x += raycasterFar * rayL.ray.direction.x;
  rayL.ray.origin.z += raycasterFar * rayL.ray.direction.z;
  intersections = rayL.intersectObjects(mapCreatorObject.getDoors()).concat(rayL.intersectObjects(mapCreatorObject.getWalls()));
  if (intersections.length) {
    colitions.nx = false;
  }
  rayR.ray.direction.x = -(Math.cos(3 * Math.PI / 2) * direction.x - Math.sin(3 * Math.PI / 2) * direction.z);
  rayR.ray.direction.z = -(Math.sin(3 * Math.PI / 2) * direction.x + Math.cos(3 * Math.PI / 2) * direction.z);
  rayR.ray.origin.copy(controls.getObject().position);
  rayR.ray.origin.x += raycasterFar * rayR.ray.direction.x;
  rayR.ray.origin.z += raycasterFar * rayR.ray.direction.z;
  intersections = rayR.intersectObjects(mapCreatorObject.getDoors()).concat(rayR.intersectObjects(mapCreatorObject.getWalls()));
  if (intersections.length) {
    colitions.px = false;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
