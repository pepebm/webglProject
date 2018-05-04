let moveForward = false,
    moveBackward = false,
    moveRight = false,
    moveLeft = false,
    velocity,
    direction;

// event listener
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

function handleMovement(delta, colitions) {
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward && colitions.nz) - Number(moveBackward && colitions.pz);
  direction.x = Number(moveLeft && colitions.nx) - Number(moveRight && colitions.px);
  direction.normalize(); // this ensures consistent movements in all directions

  if (moveForward || moveBackward)
    velocity.z -= direction.z * 400.0 * delta;
  if (moveLeft || moveRight)
    velocity.x -= direction.x * 400.0 * delta;

  controls.getObject().translateX(velocity.x * delta);
  controls.getObject().translateZ(velocity.z * delta);

  prevTime = time;
}
