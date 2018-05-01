const mapCreator = function() {
  const HEIGHT = 25;
  const WIDTH = 20;
  const HALLWAY_SIZE = 60;
  const OFFSET = WIDTH / 2;
  const HALLWAYS = [];
  const UNIONS = []; // NOT NECESSARY
  const DOORS = [];
  let num_doors, door_probability;
  const walkers = [];
  const materials = {
    initialized: false,
    floor: null,
    walls: null,
    ceil: null,
    door: null
  };

  let mapCreatorObject = {
    getWidth: () => WIDTH,
    getHeight: () => HEIGHT,
    getSize: () => HALLWAY_SIZE,
    loadMaterials: textures => {
      let map = THREE.ImageUtils.loadTexture(textures.floor);
      materials.floor = new THREE.MeshBasicMaterial({map});
      map = THREE.ImageUtils.loadTexture(textures.walls);
      materials.walls = new THREE.MeshBasicMaterial({map, side: THREE.DoubleSide});
      map = THREE.ImageUtils.loadTexture(textures.ceil);
      materials.ceil = new THREE.MeshBasicMaterial({map});
      map = THREE.ImageUtils.loadTexture(textures.door);
      materials.door = new THREE.MeshBasicMaterial({map, side: THREE.DoubleSide});
      materials.initialized = true;
    },
    createHallway: options => {
      if(materials.initialized){
        let hallwayGroup = new THREE.Object3D;
        let geometry = new THREE.PlaneGeometry(WIDTH, HALLWAY_SIZE);
        let plane = new THREE.Mesh(geometry, materials.floor);
        plane.name = "floor";
        plane.rotation.x = -Math.PI / 2;
        hallwayGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.ceil);
        plane.name = "ceil";
        plane.rotation.x = Math.PI / 2;
        plane.position.y = HEIGHT;
        hallwayGroup.add(plane);

        geometry = new THREE.PlaneGeometry(HALLWAY_SIZE, HEIGHT);
        plane = new THREE.Mesh(geometry, materials.walls);
        plane.name = "right_wall";
        plane.rotation.y = -Math.PI / 2;
        plane.position.x = WIDTH / 2;
        plane.position.y = HEIGHT / 2;
        hallwayGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.walls);
        plane.name = "left_wall";
        plane.rotation.y = Math.PI / 2;
        plane.position.x = -WIDTH / 2;
        plane.position.y = HEIGHT / 2;
        hallwayGroup.add(plane);

        if(HALLWAYS.length == 0){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "back_wall";
          plane.rotation.y = Math.PI;
          plane.position.z = HALLWAY_SIZE / 2;
          plane.position.y = HEIGHT / 2;
          hallwayGroup.add(plane);
        }
        if(options.door){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT)
          door = new THREE.Mesh(geometry, materials.door);
          door.name = "door";
          door.position.y = HEIGHT / 2;
          door.position.z = -HALLWAY_SIZE / 2;
          hallwayGroup.add(door);
          DOORS.push(door);
        }

        hallwayGroup.position.set(...options.position);
        hallwayGroup.rotation.y = options.rotation * Math.PI / 2;

        HALLWAYS.push(hallwayGroup);
        return hallwayGroup;
      } else{
        throw new TypeError("Load materials first!");
      }
    },
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
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "right_wall";
          plane.rotation.y = -Math.PI / 2;
          plane.position.x = WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.nx){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "left_wall";
          plane.rotation.y = Math.PI / 2;
          plane.position.x = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.pz){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "back_wall";
          plane.rotation.y = Math.PI;
          plane.position.z = WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        if(options.walls.nz){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "front_wall";
          plane.position.z = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          unionGroup.add(plane);
        }
        unionGroup.position.set(...options.position);

        UNIONS.push(unionGroup);
        return unionGroup;
      } else{
        throw new TypeError("Load materials first!");
      }
    },
  }

  const rnd = (limSup, limInf, except) => {
    let num = Math.floor(Math.random() * (limSup - limInf)) + limInf;
    if(!!except){
      if(typeof except == "number"){
        if(num == except) return rnd(limSup, limInf, except);
        else return num;
      } else if(typeof except == "object"){
        if(except.find(val => val == num) !== undefined) return rnd(limSup, limInf, except);
        else return num;
      }
    }
    return num;
  };

  const walkerCreator = function(options){
    let name = "walker_" + walkers.length;
    let draw_hallway = true;
    let facing = !!options ? options.facing : rnd(0,4);
    let pos = !!options ? options.position : [0,0,0];
    const walk = function(){
      if(facing == 0){
        pos[2] -= HALLWAY_SIZE / 2 + OFFSET;
      }
      else if(facing == 1){
        pos[0] -= HALLWAY_SIZE / 2 + OFFSET;
      }
      else if(facing == 2){
        pos[2] += HALLWAY_SIZE / 2 + OFFSET;
      }
      else{
        pos[0] += HALLWAY_SIZE / 2 + OFFSET;
      }
    }
    const deleteWalker = function(){
      let idx = walkers.indexOf(walkers.find(val => val.getName() == name));
      walkers.splice(idx, 1);
      for (var i = idx; i < walkers.length; i++) {
        walkers[i].updateName("walker_" + i);
      }
    }

    const walker = {
      walk,
      getName: () => name,
      updateName: _name => {
        name = _name;
      },
      deleteWalker,
      next: () => {
        if (draw_hallway) {
          let hallway = mapCreatorObject.createHallway({
            position: pos,
            rotation: facing,
            door: DOORS.length < num_doors && rnd(0, door_probability) == 0
          });
          walk();
          draw_hallway = false;
          return hallway;
        } else{
          let walls;
          if(DOORS.length == num_doors){
            walls = {
              nz: facing == 2 ? false : true,
              pz: facing == 0 ? false : true,
              nx: facing == 3 ? false : true,
              px: facing == 1 ? false : true,
            }
            deleteWalker();
          } else{
            let open = rnd(walkers.length == 1 ? 1 : 0, 4);
            if(open == 0) {
              deleteWalker();
              walls = {
                nz: facing == 2 ? false : true,
                pz: facing == 0 ? false : true,
                nx: facing == 3 ? false : true,
                px: facing == 1 ? false : true,
              }
            } else {
              let open_walls = [];
              if(facing == 2) open_walls.push(0);
              else if(facing == 0) open_walls.push(2);
              else if(facing == 3) open_walls.push(1);
              else if(facing == 1) open_walls.push(3);
              let _facing = facing;
              for (var i = 1; i <= open; i++) {
                open_walls.push(rnd(0, 4, open_walls));
                if(i == 1){
                  facing = open_walls[i];
                } else{
                  let new_walker = walkerCreator({
                    facing: open_walls[i],
                    position: pos.slice(0)
                  });
                  new_walker.walk();
                  walkers.push(new_walker);
                }
              }
              walls = {
                nz: open_walls.find(val => val == 0) === undefined,
                pz: open_walls.find(val => val == 2) === undefined,
                nx: open_walls.find(val => val == 1) === undefined,
                px: open_walls.find(val => val == 3) === undefined
              }
            }
          }
          let union = mapCreatorObject.createUnion({
            position: pos,
            walls
          });
          walk();
          draw_hallway = true;
          return union;
        }
      }
    }
    return walker;
  }

  mapCreatorObject.randomize = (options) => {
    num_doors = options.doors_count;
    door_probability = options.door_probability;
    let walker = walkerCreator();
    walkers.push(walker);
    while(walkers.length > 0){
      for (var i = 0; i < walkers.length; i++) {
        for (var j = 0; j < 2; j++) {
          let objCreated = walkers[i].next();
          scene.add(objCreated);
        }
      }
    }
  }
  return mapCreatorObject;
}()
