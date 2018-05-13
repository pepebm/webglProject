// THIS FILE CONTAINS ALL THE LOGIC OF THE MINI GAMES AND WINDOW HANDELING
// playerInGame variable located at init.js so that we can use it at run()
const gameArchieve = {
        len: 4,
        frogger: {
          dir: '../miniGames/frogger/main.html',
          hasPlayed: false
        },
        simonSays: {
          dir: '../miniGames/simon-says/main.html',
          hasPlayed: false
        },
        alienInvasion: {
          dir: '../miniGames/alien/main.html',
          hasPlayed: false
        },
        runner: {
          dir: '../miniGames/runner/main.html',
          hasPlayed: false
        }
      };
var miniGameWindow = null;

function createMiniGame() {
  let game = Math.floor((Math.random() * gameArchieve.len));
  switch (game) {
    case 0:
      runFrogger();
      break;
    case 1:
      runSimonSays();
      break;
    case 2:
      runAlienInvasion();
      break;
    case 3:
      runRunner();
      break;
    default:
      break;
  }
}

function openWindow(dir, windowTitle) {
  let element = document.body;
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
  openWindow(gameArchieve.frogger.dir, "Frogger - MiniGame");
}

function runSimonSays(){
  openWindow(gameArchieve.simonSays.dir, "Simon Says - MiniGame");
}

function runAlienInvasion(){
  openWindow(gameArchieve.alienInvasion.dir, "Alien Invasion - MiniGame");
}

function runRunner(){
  openWindow(gameArchieve.runner.dir, "Runner - MiniGame");
}
