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
    let hallwayGroup = new THREE.Object3D;
    let width = 15;
    let height = 20;
    let geometry = new THREE.PlaneGeometry(width, size);
    let plane = new THREE.Mesh(geometry, materials.floor);
    plane.name = "floor";
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2]
    );
    hallwayGroup.add(plane);

    plane = new THREE.Mesh(geometry, materials.ceil);
    plane.name = "ceil";
    plane.rotation.x = Math.PI / 2;
    plane.position.y = height;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2]
    );
    hallwayGroup.add(plane);

    geometry = new THREE.PlaneGeometry(height, size);
    plane = new THREE.Mesh(geometry, materials.walls);
    plane.name = "right_wall";
    plane.rotation.z = Math.PI / 2;
    plane.rotation.y = -Math.PI / 2;
    plane.position.x = width / 2;
    plane.position.y = height / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2]
    );
    hallwayGroup.add(plane);

    plane = new THREE.Mesh(geometry, materials.walls);
    plane.name = "left_wall";
    plane.rotation.z = Math.PI / 2;
    plane.rotation.y = Math.PI / 2;
    plane.position.x = -width / 2;
    plane.position.y = height / 2;
    plane.position.set(
      plane.position.x + position[0],
      plane.position.y + position[1],
      plane.position.z + position[2]
    );
    hallwayGroup.add(plane);
    scene.add(hallwayGroup);
  } else{
    throw new TypeError("Load materials first!");
  }
}
