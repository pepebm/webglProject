var camera, scene, renderer, controls;
var objects = [];
var kills = 0, score = 0;
var objLoader;
var spaceInvaderTexture, spaceInvaderTexture2;
var spaceMats = [];

var bulletGeometry;
var bulletMaterial;
var raycaster;
var bullets = [];
var bulletsRaycasters = [];
var intervalId;

var blocker, instructions;

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity, direction;

var floorUrl = "../images/moon_1024.jpg";

function initPointerLock() {
  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  if (havePointerLock) {
    var element = document.body;
    var pointerlockchange = function(event) {
      if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        controls.enabled = true;
        blocker.style.display = 'none';
      } else {
        controls.enabled = false;
        blocker.style.display = 'block';
        instructions.style.display = '';
      }
    };
    var pointerlockerror = function(event) {
      instructions.style.display = '';
    };

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

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

function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = true;
      break;
    case 37: // left
    case 65: // a
      moveLeft = true;
      break;
    case 40: // down
    case 83: // s
      moveBackward = true;
      break;
    case 39: // right
    case 68: // d
      moveRight = true;
      break;
    case 32: // space
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;
    case 16: // Shift
      createBullet();
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = false;
      break;
    case 37: // left
    case 65: // a
      moveLeft = false;
      break;

    case 40: // down
    case 83: // s
      moveBackward = false;
      break;
    case 39: // right
    case 68: // d
      moveRight = false;
      break;
  }
}

function createScene(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onWindowResize, false);

  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();

  blocker = document.getElementById('blocker');
  instructions = document.getElementById('instructions');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 550);

  // A light source positioned directly above the scene, with color fading from the sky color to the ground color.
  // HemisphereLight( skyColor, groundColor, intensity )
  // skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
  // groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
  // intensity - (optional) numeric value of the light's strength/intensity. Default is 1.

  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  controls = new THREE.PointerLockControls(camera);
  scene.add(controls.getObject());

  bulletMaterial = new THREE.MeshBasicMaterial({color:0x000000});
  bulletGeometry = new THREE.SphereGeometry(0.3,20,20);

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  // Raycaster( origin, direction, near, far )
  // origin — The origin vector where the ray casts from.
  // direction — The direction vector that gives direction to the ray. Should be normalized.
  // near — All results returned are further away than near. Near can't be negative. Default value is 0.
  // far — All results returned are closer then far. Far can't be lower then near . Default value is Infinity.
  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

  // floor
  var map = new THREE.TextureLoader().load(floorUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  var floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  var floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: map,
    side: THREE.DoubleSide
  }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  intervalId = setInterval(function() {
    if(controls.enabled){
      let px = Math.floor(Math.random() * 100) - 50;
      let py = Math.floor(Math.random() * 50) + 5;
      let pz = Math.floor(Math.random() * 100) - 50;
      let s = (Math.floor(Math.random() * 3)) * 2 + 1;
      createAlien([px, py, pz], s);
    }
  }, 1500);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function run() {
  requestAnimationFrame(run);

  if (controlsEnabled === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects(objects);

    var onObject = intersections.length > 0;

    var time = performance.now();
    var delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }
    prevTime = time;
  }

  renderer.render(scene, camera);

  for (var i = 0; i < bullets.length; i++) {
    bullets[i].translateX(bulletsRaycasters[i].ray.direction.x * 10);
    bullets[i].translateY(bulletsRaycasters[i].ray.direction.y * 10);
    bullets[i].translateZ(bulletsRaycasters[i].ray.direction.z * 10);
  }

  for (var i = 0; i < bullets.length; i++) {
    bulletsRaycasters[i].ray.origin.copy(bullets[i].position);
    bullets[i].life -= delta;
    let hit = bulletsRaycasters[i].intersectObjects(objects);
    if(hit.length > 0){
      var idx = objects.indexOf(hit[0].object)
      objects.splice(idx,1);
      scene.remove(spaceMats[idx]);
      spaceMats.splice(idx,1);

      scene.remove(bullets[i]);
      bullets.splice(i,1);
      bulletsRaycasters.splice(i,1);
      kills += 1;
      $("#counter").text("Aliens Killed: " + kills);
      score += hit[0].object.scale.x == 1 ? 30 : hit[0].object.scale.x == 3 ? 20 : 10;
      $("#score").text("Score: " + score);
    }
    else if(bullets[i].life < 0){
      scene.remove(bullets[i]);
      bullets.splice(i,1);
      bulletsRaycasters.splice(i,1);
    }
  }

  if(controls.enabled){
    for (var i = 0; i < objects.length; i++) {
      objects[i].life -= delta;
      if(objects[i].life < 0){
        objects.splice(i,1);
        scene.remove(spaceMats[i]);
        spaceMats.splice(i,1);
      }
      if(i % 3 == 0) objects[i].translateX(delta * 2 * (kills + 1));
      else if(i % 3 == 1){
        if(objects[i].position.y > 100) objects[i].direction = -1;
        else if(objects[i].position.y < 5) objects[i].direction = 1;
        objects[i].translateY(delta * 2 * (kills + 1) * objects[i].direction);

      }
      else objects[i].translateZ(delta * 2 * (kills + 1));
      if(kills >= 30 || score >= 500){
        objects[i].rotateY(delta * Math.PI)
      }
    }
  }
}

function createBullet() {
  let bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(controls.getObject().position);
  bullet.life = 1;
  scene.add(bullet);
  bullets.push(bullet);
  let bulletRaycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);
  bulletRaycaster.ray.origin.copy(controls.getObject().position)
  bulletRaycaster.ray.direction.copy(controls.getDirection(camera.position));
  bulletsRaycasters.push(bulletRaycaster);
}

function createAlien(position, scale) {
  if(!objLoader) objLoader = new THREE.OBJLoader();
  objLoader.load("../models/SpaceInvader/SpaceInvaderss.obj",
    function(object) {
      if(!spaceInvaderTexture) spaceInvaderTexture = new THREE.TextureLoader().load("../models/SpaceInvader/SpaceInvaderss.png");
      object.traverse( function(child){
        if(child instanceof THREE.Mesh){
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.map = spaceInvaderTexture;
        }
      });
      spaceMats.push(object);
      object.children[0].position.set(...position);
      object.children[0].scale.set(scale,scale,scale);
      object.children[0].rotation.y = Math.random() * Math.PI * 2
      object.children[0].life = 12;
      object.children[0].direction = 1;
      objects.push(object.children[0]);
      scene.add(object);
    }
  );
}
