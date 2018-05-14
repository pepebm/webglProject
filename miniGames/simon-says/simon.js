var container;
var camera,
  scene,
  raycaster,
  renderer,
  boardGroup = null;
var mouse = new THREE.Vector2(),
  INTERSECTED;
var radius = 100,
  theta = 0;
var moves = [];
var startAnimation = null,
    clickAnimation = null,
    sequenceAnimation = null,
    duration = 2, // sec
    loopAnimation = false;

var userMove = 0,
    lvl = 0,
    score = 0;

var playerLost = false;
function generateMove() {
  console.log("Nivel " + lvl);
  // index to move
  moves.push(Math.floor(Math.random() * boardGroup.children.length));
  // llamar animacion para decirle al usuario el siguiente cuadro
  animationRecursive(0);
}

function animationRecursive(idx) {
  var promise = new Promise((resolve, reject) => {
      playSequence(moves[idx]);
      setTimeout(()=>{resolve("Animation ended")}, 900);
    })
    .then((success) => {
      if (idx < moves.length - 1) {
        idx += 1;
        animationRecursive(idx);
      }
    }).catch((error) =>{
      console.log(error + " at animation promise");
    });
}

function validateMove(idx) {
  if(idx == moves[userMove]) {
    userMove += 1;
    score += 1;
    $('#scoreNum').text(score);
    if(userMove > moves.length - 1) {
      console.log("Next level");
      lvl += 1;
      if (lvl == 8) {
        window.opener.killWindowProcess(1);
      }
      $('#lvlNum').text(lvl);
      $('#plus').addClass('animate-flicker').show();
      userMove = 0;
      setTimeout(() =>{
        $('#plus').removeClass('animate-flicker').hide();
      }, 2000);
      setTimeout(()=> {
        generateMove();
      }, 1000);
    }
  } else {
    console.log("Loser. Thanks for playing");
    console.log("You reached level " + lvl);
    window.opener.killWindowProcess(0);
  }
}

function initAnimations() {
  startAnimation = new KF.KeyFrameAnimator;
  startInterps = [];
  for (var i = 0; i < boardGroup.children.length; i++) {
    startInterps.push(
      {
        keys: [
          0, .5, 1
        ],
        values: [
          {
            z: 0
          },
          {
            z: Math.PI
          },
          {
            z: Math.PI * 2
          }
        ],
        target: boardGroup.children[i].rotation
      }
    );
  }
  startAnimation.init({
    interps: startInterps,
    loop: loopAnimation,
    duration: duration * 1000
  });
  clickAnimation = new KF.KeyFrameAnimator;
  clickAnimation.init({
    interps: [
      {
        keys: [
          0, .5, 1
        ],
        values: [
          {
            y: 0
          },
          {
            y: Math.PI
          },
          {
            y: Math.PI * 2
          }
        ],
        target: null
      }
    ],
    loop: loopAnimation,
    duration: duration * 250
  });
  sequenceAnimation = new KF.KeyFrameAnimator;
  sequenceAnimation.init({
    interps: [
      {
        keys: [
          0, .25, .75, 1
        ],
        values: [
          {
            y: 0
          },
          {
            y: 0.5
          },
          {
            y: 0.25
          },
          {
            y: 0.5
          }
        ],
        target: null
      }
    ],
    loop: loopAnimation,
    duration: duration * 400
  });
}

function playClickAnimation(idx) {
  clickAnimation.interps[0].target = boardGroup.children[idx].rotation;
  clickAnimation.start();
}

function playIntro() {
  startAnimation.start();
}

function hint() {
  score -= 1;
  $('#scoreNum').text(score);
  sequenceAnimation.interps[0].target = boardGroup.children[moves[userMove]].scale;
  sequenceAnimation.start();
}

function playSequence(idx){
  sequenceAnimation.interps[0].target = boardGroup.children[idx].scale;
  sequenceAnimation.start();
}

function run() {
  requestAnimationFrame(run);

  // Update the animations
  KF.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}

function createScene(canvas) {
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

  // Set the viewport size
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  createBoard();

  // set up the animations
  initAnimations();

  raycaster = new THREE.Raycaster();

  renderer.setPixelRatio(window.devicePixelRatio);

  document.addEventListener('mousedown', onDocumentMouseDown);

  window.addEventListener('resize', onWindowResize);

  initGame();
}

function initGame() {
  console.log("Welcome to Simon Says");
  moves = [];
  userMove = 0;
  lvl = 0;
  score = 0;
  $('#lvlNum').text(lvl);
  $('#scoreNum').text(score);
  $('#plus').hide();
  playIntro();
  setTimeout(() => generateMove(), 2500);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  var idx;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // find intersections
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children[1].children);
  if (intersects.length > 0) {
    INTERSECTED = intersects[0].object;
    INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
    INTERSECTED.material.emissive.setHex(0xff0000);
    idx = boardGroup.children.indexOf(INTERSECTED);
    playClickAnimation(idx);
    validateMove(idx);
    setTimeout(
      () => INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex),
      500 // ms
     );
  } else {
    if (INTERSECTED)
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

    INTERSECTED = null;
  }
}

function createBoard() {
  boardGroup = new THREE.Object3D();
  boardGroup.name = "Board Cubes";
  scene.add(boardGroup);
  var object = null;
  var geometry = new THREE.BoxBufferGeometry(20, 20, 10);
  var _x = -30;
  for (var i = 0; i < 4; i++) {
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
    );
    object.name = i;
    object.position.x = _x;
    object.position.y = 20;
    object.position.z = -100;
    object.scale.x = 0.5;
    object.scale.y = 0.5;
    object.scale.z = 0.5;
    _x += 20;
    boardGroup.add(object);
  }
  _x = -30;
  for (i = i; i < 8; i++) {
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
    );
    object.name = i;
    object.position.x = _x;
    object.position.y = 5;
    object.position.z = -100;
    object.scale.x = 0.5;
    object.scale.y = 0.5;
    object.scale.z = 0.5;
    _x += 20;
    boardGroup.add(object);
  }
  _x = -30;
  for (i = i; i < 12; i++) {
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
    );
    object.name = i;
    object.position.x = _x;
    object.position.y = -10;
    object.position.z = -100;
    object.scale.x = 0.5;
    object.scale.y = 0.5;
    object.scale.z = 0.5;
    _x += 20;
    boardGroup.add(object);
  }
}
