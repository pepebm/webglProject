// loadMaterials({
//   floor: '../resources/textures/floor1.jpeg',
//   walls: '../resources/textures/floor3.jpg',
//   ceil: '../resources/textures/floor1.jpeg'
// });
//
// createHallway(scene, 15);
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

function createHallway(scene, size, position = [0,0,0]){
  if(materials.initialized){
    let width = 5;
    let height = 10;
    let geometry = new THREE.PlaneGeometry(width, size);
    let plane = new THREE.Mesh(geometry, materials.floor);
    plane.rotation.x = Math.PI / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2],
    );
    scene.add(plane);

    plane = new THREE.Mesh(geometry, materials.ceil);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = height;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2],
    );
    scene.add(plane);

    geometry = new THREE.PlaneGeometry(height, size);
    plane = new THREE.Mesh(geometry, materials.walls);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.z = Math.PI / 2;
    plane.position.x = -width / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2],
    );
    scene.add(plane);

    plane = new THREE.Mesh(geometry, materials.walls);
    plane.rotation.x = Math.PI / 2;
    plane.rotation.z = Math.PI / 2;
    plane.position.x = width / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2],
    );
    scene.add(plane);
  } else{
    throw new TypeError("Load materials first!");
  }
}
