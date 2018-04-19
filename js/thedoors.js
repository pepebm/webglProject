
let materials = {
  initialized: false,
  floor: null,
  walls: null,
  ceil: null
}

function loadMaterials(paths){
  let map = THREE.ImageUtils.loadTexture(paths.floor);
  materials.floor = new THREE.MeshBasicMaterial({map});
  map = THREE.ImageUtils.loadTexture(paths.walls);
  materials.walls = new THREE.MeshBasicMaterial({map});
  map = THREE.ImageUtils.loadTexture(paths.ceil);
  materials.ceil = new THREE.MeshBasicMaterial({map});
  materials.initialized = true;
}

function createHallway(scene, size, position){
  if(materials.initialized){
    let width = 5;
    let height = 10;
    let geometry = new THREE.PlaneGeometry(width, size);
    let plane = new THREE.Mesh(geometry, materials.floor);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);

    plane = new THREE.Mesh(geometry, materials.ceil);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = height;
    scene.add(plane);

    geometry = new THREE.PlaneGeometry(height, size);
    plane = new THREE.Mesh(geometry, materials.walls);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.z = Math.PI / 2;
    plane.position.x = -width / 2;
    scene.add(plane);

    plane = new THREE.Mesh(geometry, materials.walls);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.z = Math.PI / 2;
    plane.position.x = width / 2;
    scene.add(plane);
  } else{
    console.log("Load materials first!");
    // alert("Load materials first!");
  }
}
