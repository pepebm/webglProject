const mapCreatorObject = function() {
  const HEIGHT = 40;
  const WIDTH = 30;
  const HALLWAY_SIZE = 60;
  const OFFSET = WIDTH / 2;
  const HALLWAYS = [];
  const UNIONS = [];
  const DOORS = [];
  const WALLS = [];
  const objLoader = new THREE.OBJLoader();
  let fireParticlesGroup;
  let num_doors;
  let door_rand_max;
  let light_right_side = true;
  const walkers = [];
  const materials = {
    initialized: false,
    floor: null,
    walls: null,
    ceil: null,
    door: null,
  };
  let torchObjPath;

  let mapCreator = {
    getDoors: () => DOORS,
    getWalls: () => WALLS,
    getWidth: () => WIDTH,
    getHeight: () => HEIGHT,
    getSize: () => HALLWAY_SIZE,
    getParticlesGroup: () => fireParticlesGroup,
    removeDoor: door => {
      let idx = DOORS.indexOf(door);
      if (idx >= 0) {
        DOORS.splice(idx, 1);
        for (var i = 0; i < HALLWAYS.length; i++) {
          for (var j = 0; j < HALLWAYS[i].children.length; j++) {
            if(HALLWAYS[i].children[j] == door){
              HALLWAYS[i].remove(door);
            }
          }
        }
      }
    },
    loadMaterials: paths => {
      let map = THREE.ImageUtils.loadTexture(paths.floor);
      materials.floor = new THREE.MeshPhongMaterial({map});
      map = THREE.ImageUtils.loadTexture(paths.walls);
      materials.walls = new THREE.MeshPhongMaterial({map, side: THREE.DoubleSide});
      map = THREE.ImageUtils.loadTexture(paths.ceil);
      materials.ceil = new THREE.MeshPhongMaterial({map});
      map = THREE.ImageUtils.loadTexture(paths.door);
      materials.door = new THREE.MeshPhongMaterial({map, side: THREE.DoubleSide});

      fireParticlesGroup = new SPE.Group({
          texture: {
              value: THREE.ImageUtils.loadTexture(paths.fireParticles),
              frames: new THREE.Vector2( 8, 4 ),
              loop: 2
          }
      });

      torchObjPath = paths.torch;

      materials.initialized = true;
    },
    createHallway: options => {
      if(materials.initialized){
        let hallwayGroup = new THREE.Object3D;

        let light = new THREE.PointLight(0xffffff, 1, HALLWAY_SIZE + OFFSET / 2);
        light.position.set((light_right_side ? OFFSET - 3 : 3 - OFFSET), HEIGHT * 2 / 3, 0);
        light_right_side = !light_right_side;
        hallwayGroup.add(light);

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
        WALLS.push(plane);
        hallwayGroup.add(plane);

        plane = new THREE.Mesh(geometry, materials.walls);
        plane.name = "left_wall";
        plane.rotation.y = Math.PI / 2;
        plane.position.x = -WIDTH / 2;
        plane.position.y = HEIGHT / 2;
        WALLS.push(plane);
        hallwayGroup.add(plane);

        if(HALLWAYS.length == 0){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "back_wall";
          plane.rotation.y = Math.PI;
          plane.position.z = HALLWAY_SIZE / 2;
          plane.position.y = HEIGHT / 2;
          WALLS.push(plane);
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

        objLoader.load(
          torchObjPath,
          function(object) {
            object.traverse( function(child){
                if(child instanceof THREE.Mesh){
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                object.position.copy(light.position);
                object.position.y = HEIGHT / 2;
                console.log(options.rotation);
                if (object.position.x < 0 || object.position.z < 0) {
                  object.rotation.y = Math.PI;
                }
                hallwayGroup.add(object);
            });
          },
          null,
          error => {
            throw new Error('An error happened loading torches objs')
          }
        );

        hallwayGroup.position.set(...options.position);
        hallwayGroup.rotation.y = options.rotation * Math.PI / 2;

        HALLWAYS.push(hallwayGroup);
        return hallwayGroup;
      } else{
        throw new Error("Load materials first!");
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
          WALLS.push(plane);
          unionGroup.add(plane);
        }
        if(options.walls.nx){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "left_wall";
          plane.rotation.y = Math.PI / 2;
          plane.position.x = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          WALLS.push(plane);
          unionGroup.add(plane);
        }
        if(options.walls.pz){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "back_wall";
          plane.rotation.y = Math.PI;
          plane.position.z = WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          WALLS.push(plane);
          unionGroup.add(plane);
        }
        if(options.walls.nz){
          geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
          plane = new THREE.Mesh(geometry, materials.walls);
          plane.name = "front_wall";
          plane.position.z = -WIDTH / 2;
          plane.position.y = HEIGHT / 2;
          WALLS.push(plane);
          unionGroup.add(plane);
        }
        unionGroup.position.set(...options.position);

        UNIONS.push(unionGroup);
        return unionGroup;
      } else{
        throw new Error("Load materials first!");
      }
    },
    createParticles: () => {
      for (var i = 0; i < HALLWAYS.length; i++) {
        fireEmitter = new SPE.Emitter({
          particleCount: 50,
          maxAge: {
            value: 2,
            spread: 0
          },
          position: {
            value: new THREE.Vector3(
              HALLWAYS[i].position.x + (Math.cos(HALLWAYS[i].rotation.y) * HALLWAYS[i].children[0].position.x - Math.sin(HALLWAYS[i].rotation.y) * HALLWAYS[i].children[0].position.z),
              HEIGHT * 3 / 4,
              HALLWAYS[i].position.z - (Math.sin(HALLWAYS[i].rotation.y) * HALLWAYS[i].children[0].position.x + Math.cos(HALLWAYS[i].rotation.y) * HALLWAYS[i].children[0].position.z)
            ),
            spread: new THREE.Vector3( 0, 5, 0 ),
            spreadClamp: new THREE.Vector3( 0, 0, 0 ),
            distribution: SPE.distributions.BOX,
            randomise: true
          },
          radius: {
            value: 3,
            spread: 0,
            scale: new THREE.Vector3( 1, 1, 1 ),
            spreadClamp: new THREE.Vector3( 2, 2, 2 ),
          },
          velocity: {
            value: new THREE.Vector3( 0, 0, 0 ),
            spread: new THREE.Vector3( 0, 0, 0 ),
            // distribution: SPE.distributions.BOX,
            randomise: false
          },
          acceleration: {
            value: new THREE.Vector3( 0, 0, 0 ),
            spread: new THREE.Vector3( 0, 0, 0 ),
            // distribution: SPE.distributions.BOX,
            randomise: false
          },
          drag: {
            value: 0.5,
            spread: 0
          },
          wiggle: {
            value: 0,
            spread: 0
          },
          rotation: {
            axis: new THREE.Vector3( 0, 1, 0 ),
            axisSpread: new THREE.Vector3( 0, 0, 0 ),
            angle:  0, // radians
            angleSpread: 0, // radians
            static: false,
            center: new THREE.Vector3( 0, 0, 0 )
          },
          size: {
            value: 20,
            spread: 0
          },
          opacity: {
            value: 0.50
          },
          angle: {
            value: 0,
            spread: 0
          }
        });
        fireParticlesGroup.addEmitter(fireEmitter);
      }
      scene.add(fireParticlesGroup.mesh);
    }
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
          let hallway = mapCreator.createHallway({
            position: pos,
            rotation: facing,
            door: DOORS.length < num_doors && rnd(0, door_rand_max) == 0
          });
          walk();
          draw_hallway = false;
          return hallway;
        } else{
          let walls;
          if(DOORS.length == num_doors){
            deleteWalker();
            walls = {
              nz: facing == 2 ? false : true,
              pz: facing == 0 ? false : true,
              nx: facing == 3 ? false : true,
              px: facing == 1 ? false : true,
            }
          } else{
            const open = rnd(walkers.length == 1 ? 1 : 0, 4);
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
          let union = mapCreator.createUnion({
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

  mapCreator.randomize = options => {
    num_doors = options.doors_count;
    door_rand_max = options.door_rand_max;
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
    mapCreator.createParticles();
  }
  return mapCreator;
}()
