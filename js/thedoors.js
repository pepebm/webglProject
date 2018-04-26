const mapDrawerCreator = function(w, h) {
  let WIDTH = w;
  let HEIGHT = h;
  let materials = {
    initialized: false,
    floor: null,
    walls: null,
    ceil: null
  };
  return {
    getWidth: () => WIDTH,
    loadMaterials: textures => {
      let map = THREE.ImageUtils.loadTexture(textures.floor);
      materials.floor = new THREE.MeshBasicMaterial({map});
      map = THREE.ImageUtils.loadTexture(textures.walls);
      materials.walls = new THREE.MeshBasicMaterial({map});
      map = THREE.ImageUtils.loadTexture(textures.ceil);
      materials.ceil = new THREE.MeshBasicMaterial({map});
      materials.initialized = true;
    },
    // options contains size, position and rotation
    createHallway: options => {
      if(materials.initialized){
        let hallwayGroup = new THREE.Object3D;
        let geometry = new THREE.PlaneGeometry(WIDTH, options.size);
        let plane = new THREE.Mesh(geometry, materials.floor);
        plane.name = "floor";
        plane.rotation.x = -Math.PI / 2;
        hallwayGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.ceil);
        plane.name = "ceil";
        plane.rotation.x = Math.PI / 2;
        plane.position.y = HEIGHT;
        hallwayGroup.add(plane);

        geometry = new THREE.PlaneGeometry(HEIGHT, options.size);
        plane = new THREE.Mesh(geometry, materials.walls);
        plane.name = "right_wall";
        plane.rotation.z = Math.PI / 2;
        plane.rotation.y = -Math.PI / 2;
        plane.position.x = WIDTH / 2;
        plane.position.y = HEIGHT / 2;
        hallwayGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.walls);
        plane.name = "left_wall";
        plane.rotation.z = Math.PI / 2;
        plane.rotation.y = Math.PI / 2;
        plane.position.x = -WIDTH / 2;
        plane.position.y = HEIGHT / 2;
        hallwayGroup.add(plane);

        hallwayGroup.position.set(...options.position);
        hallwayGroup.rotation.y = options.rotation;

        return hallwayGroup;
      } else{
        throw new TypeError("Load materials first!");
      }
    },
    // options contains position, offset and walls
    createUnion: options => {
      if(materials.initialized){
        let unionGroup = new THREE.Object3D;
        let geometry = new THREE.PlaneGeometry(WIDTH, WIDTH);
        let plane = new THREE.Mesh(geometry, materials.floor);
        plane.name = "floor";
        plane.rotation.x = -Math.PI / 2;
        unionGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.ceil);
        plane.name = "ceil";
        plane.rotation.x = Math.PI / 2;
        plane.position.y = HEIGHT;
        unionGroup.add(plane);

        if(options.walls.px){
          geometry = new THREE.PlaneGeometry(HEIGHT, WIDTH);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "right_wall";
          plane.rotation.z = Math.PI / 2;
          plane.rotation.y = -Math.PI / 2;
          plane.position.x = WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.nx){
          geometry = new THREE.PlaneGeometry(HEIGHT, WIDTH);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "left_wall";
          plane.rotation.z = Math.PI / 2;
          plane.rotation.y = Math.PI / 2;
          plane.position.x = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.pz){
          geometry = new THREE.PlaneGeometry(HEIGHT, WIDTH);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "back_wall";
          plane.rotation.z = Math.PI / 2;
          plane.rotation.y = Math.PI;
          plane.position.z = WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.nz){
          geometry = new THREE.PlaneGeometry(HEIGHT, WIDTH);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "front_wall";
          plane.rotation.z = Math.PI / 2;
          plane.position.z = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        unionGroup.position.set(...options.position);
        unionGroup.position.x += options.offset.x * (WIDTH / 2);
        unionGroup.position.z += options.offset.z * (WIDTH / 2);

        return unionGroup;
      } else{
        throw new TypeError("Load materials first!");
      }
    }
  }
}
