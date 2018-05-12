var camera,
  scene,
  renderer,
  controls,
  frog,
  y,
  inWater = false,
  onLog = false;

var frogCol,
    carCols = [],
    logCols = [],
    waterCols = [];

var carGroup = null,
    logsGroup = null,
    boardGroup = null;

var logs = [],
    cars = [],
    lanes = [];

var blocker,
  instructions,
  delta,
  time;

var initPos = -60,
    frogSteps = 10;

var grassTextureUrl = './images/grass.jpg',
    roadTextureUrl = './images/road.jpg',
    waterTextureUrl = './images/water.jpg',
    carTextureUrl = './images/car.png'
    logTextureUrl = './images/log.jpg',
    frogTextureUrl = './images/frog.png';

var controlsEnabled = false;

var prevTime = performance.now();

function onKeyDown(event) {
  switch (event.keyCode) {
    case 65: // a
      frog.position.x -= frogSteps;
      break;
    case 68: // d
      frog.position.x += frogSteps;
      break;
    case 83: // s
      frog.position.y -= frogSteps;
      break;
    case 87: // w
      frog.position.y += frogSteps;
      break;
  }
}

function checkBounds() {
  if(frog.position.y > y) {
    frog.position.x = 0;
    frog.position.y = initPos;
    console.log('Frog died because he reached top bound');
  } else if(frog.position.x < -51) {
    frog.position.x = 0;
    frog.position.y = initPos;
    console.log('Frog died because he reached left bound');
  } else if(frog.position.x > 51) {
    frog.position.x = 0;
    frog.position.y = initPos;
    console.log('Frog died because he reached Right bound');
  } else if(frog.position.y < initPos) {
    frog.position.x = 0;
    frog.position.y = initPos;
    console.log('Frog died because he reached Bttom bound');
  }
}

function run() {
  requestAnimationFrame(run);
  checkBounds();
  updateColisions();
  renderer.render(scene, camera);
  moveCars();
  moveLogs();
  checkColisions();
}

function updateColisions() {
  frogCol.setFromObject(frog);
  carCols.forEach((carCol, i) => {
    carCol.setFromObject(cars[i]);
  });
  logCols.forEach((logCol, i) => {
    logCol.setFromObject(logs[i]);
  });
}

function checkColisions() {
  let float = false,
      inW = false;
  carCols.forEach(carCol => {
    if(frogCol.intersectsBox(carCol)) {
      console.log("You died by hitting a car");
      frog.position.x = 0;
      frog.position.y = initPos;
      frog.position.z = -100;
    }
  });
  logCols.forEach((logCol, i) => {
    if(frogCol.intersectsBox(logCol)) {
      float = true;
      frog.velocity = logs[i].velocity;
    }
  });
  waterCols.forEach(waterCol => {
    if (frogCol.intersectsBox(waterCol)) {
      inW = true;
      if (!float) {
        console.log("Drowned. Try a log next time.");
        frog.position.x = 0;
        frog.position.y = initPos;
        frog.position.z = -100;
      }
    }
  });
  inWater = inW;
  if(float) frog.translateX(frog.velocity);
}

function createScene(canvas) {
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onWindowResize, false);

  blocker = document.getElementById('blocker');
  instructions = document.getElementById('instructions');

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  scene = new THREE.Scene();
  // scene.background =  createTexture(grassTextureUrl);
  scene.background = new THREE.Color(0x748e10);

  // A light source positioned directly above the scene, with color fading from the sky color to the ground color.
  // HemisphereLight( skyColor, groundColor, intensity )
  // skyColor - (optional) hexadecimal color of the sky. Default is 0xffffff.
  // groundColor - (optional) hexadecimal color of the ground. Default is 0xffffff.
  // intensity - (optional) numeric value of the light's strength/intensity. Default is 1.
  var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  // Initialize Groups
  boardGroup = new THREE.Object3D;
  boardGroup.name = 'Lanes';
  carGroup = new THREE.Object3D;
  carGroup.name = 'Cars';
  logsGroup = new THREE.Object3D;
  logsGroup.name = 'Logs';
  scene.add(boardGroup);
  scene.add(carGroup);
  scene.add(logsGroup);

  document.addEventListener('keydown', onKeyDown, false);

  createBoard();
}

function createBoard() {
  y = initPos;
  // frog pedestal
  boardGroup.add(createLane(grassTextureUrl, [0, y, -100], [20, 10] , 'initGrass-0'));
  y += 10;
  // grass lane
  boardGroup.add(createLane(grassTextureUrl, [0, y, -100], [100,10], 'grass-1'));
  y += 10;
  // highway lane
  boardGroup.add(createLane(roadTextureUrl, [0, y, -100], [100,10], 'road-2'));
  y += 10;
  boardGroup.add(createLane(roadTextureUrl, [0, y, -100], [100,10], 'road-3'));
  y += 10;
  boardGroup.add(createLane(roadTextureUrl, [0, y, -100], [100,10], 'road-4'));
  y += 10;
  // grass lane
  boardGroup.add(createLane(grassTextureUrl, [0, y, -100], [100,10], 'grass-5'));
  y += 10;
  // water lane
  boardGroup.add(createLane(waterTextureUrl, [0, y, -100], [100,10], 'water-6'));
  y += 10;
  boardGroup.add(createLane(waterTextureUrl, [0, y, -100], [100,10], 'water-7'));
  y += 10;
  boardGroup.add(createLane(waterTextureUrl, [0, y, -100], [100,10], 'water-8'));
  y += 10;
  boardGroup.add(createLane(waterTextureUrl, [0, y, -100], [100,10], 'water-9'));
  y += 10;
  // grass lane
  boardGroup.add(createLane(grassTextureUrl, [0, y, -100], [100,10], 'grass-10'));
  y += 10;
  // finish pedestal
  boardGroup.add(createLane(grassTextureUrl, [0,y,-100], [20, 10] , 'finish-11'));
  createFrog();
}

function createFrog() {
  frog = new THREE.Mesh(
    new THREE.BoxGeometry(5,5,1),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: createTexture(frogTextureUrl),
      side: THREE.DoubleSide
    })
  );
  frog.position.x = 0;
  frog.position.y = initPos;
  frog.position.z = -100;
  frog.name = 'frog';
  frog.velocity = 0
  frogCol = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
  scene.add( frog );
}

function createLane(url, position, size, name) {
  let geometry = new THREE.PlaneGeometry(size[0], size[1], 100, 100);
  let lane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
    {
      color: 0xffffff,
      map: createTexture(url),
      side: THREE.DoubleSide
    }
  ));
  lane.right = false;
  lane.name = name;
  lane.velocity = getRandomArbitrary(0.09, 0.4) * -1;
  lane.position.x = position[0];
  lane.position.y = position[1];
  lane.position.z = position[2];
  // starts with road regex
  if (name.match(/^road.*$/)) {
    for (let i = 0; i < getRandomArbitrary(1,3); i++) {
      initCars(lane, position, name, i);
    }
  }
  // starts with water regex
  if (name.match(/^water.*$/)) {
    if (name.charAt(name.length - 1) % 2 == 0) {
      lane.right = true;
      lane.velocity *= -1;
    }
    waterCols.push( new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()) );
    waterCols[waterCols.length - 1].setFromObject(lane);
    for (let i = 0; i < getRandomArbitrary(1,3); i++) {
      initLogs(lane, position, name, i);
    }
  }
  lanes.push(lane);
  return lane;
}

function initCars(lane, position, name, idx) {
  let car = new THREE.Mesh(
    new THREE.BoxGeometry(7, 5, 1),
    new THREE.MeshBasicMaterial(
      {
        color: 0xffffff,
        map: createTexture(carTextureUrl),
        side: THREE.DoubleSide
      }
  ));
  car.name = name + '-car-' + idx;
  car.position.x = 46 - (idx*30);
  car.velocity = lane.velocity;
  cars.push(car);
  carCols.push( new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()) );
  lane.add(car);
}

function moveCars() {
  cars.forEach((c, i) => {
    c.translateX(c.velocity);
    if(c.position.x <= -51) {
      c.position.x = 47;
    }
  });
}

function initLogs(lane, position, name, idx) {
  let geometry = new THREE.BoxGeometry(getRandomArbitrary(7,10), 4, 1);
  let log = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
    {
      color: 0xffffff,
      map: createTexture(logTextureUrl),
      side: THREE.DoubleSide
    }
  ));
  log.name = name + '-log-' + idx;
  if (lane.right) {
    log.position.x = -46 + (idx*30);
  } else {
    log.position.x = 46 - (idx*30);
  }
  log.right = lane.right;
  log.velocity = lane.velocity;
  logs.push(log);
  logCols.push( new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()) );
  lane.add(log);
}

function moveLogs() {
  logs.forEach((l, i) => {
    l.translateX(l.velocity);
    if (l.right) {
      if(l.position.x >= 51) {
        l.position.x = -50;
      }
    } else {
      if(l.position.x <= -51) {
        l.position.x = 50;
      }
    }

  });
}

function createTexture(url) {
  let texture = new THREE.TextureLoader().load(url);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1,1);
  return texture;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
