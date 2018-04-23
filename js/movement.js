// event listener
function onKeyDown(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      controls.getObject.translateZ(-1);
      break;
    case 37: // left
    case 65: // a
      controls.getObject.translateX(-1);
      break;
    case 40: // down
    case 83: // s
      controls.getObject.translateZ(1);
      break;
    case 39: // right
    case 68: // d
      controls.getObject.translateX(1);
      break;
    case 74:
      fire();
      break;
  }
}
