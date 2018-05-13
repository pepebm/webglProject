// THIS FILE CONTAINS ALL THE LOGIC OF THE MINI GAMES AND WINDOW HANDELING
// playerInGame variable located at init.js so that we can use it at run()
const gameArchieve = {
        len: 2,
        frogger: {
          dir: '../miniGames/frogger/main.html',
          hasPlayed: false
        },
        simonSays: {
          dir: '../miniGames/simon-says/main.html',
          hasPlayed: false
        }
      };

var miniGameWindow = null;
function createMiniGame() {
  let game = Math.floor((Math.random() * numberOfGames));
  switch (game) {
    case 0:
      runFrogger();
      break;
    case 1:
      runSimonSays();
      break;
    default:
      break;
  }
}

function openWindow(dir, windowTitle) {
  miniGameWindow = window.open(dir, windowTitle);
  playerInGame = true;
}

function closeWindow() {
  if(miniGameWindow == null || miniGameWindow == "undefined") {
    console.log("Something went wrong locating the mini game window!");
    return;
  }
  miniGameWindow.kill();
  miniGameWindow = null;
  playerInGame = false;
}

function runFrogger(){

}

function runSimonSays(){

}
