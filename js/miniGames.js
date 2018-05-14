// THIS FILE CONTAINS ALL THE LOGIC OF THE MINI GAMES AND WINDOW HANDELING
// playerInGame variable located at init.js so that we can use it at run()
const gameArchieve = {
        len: 3,
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
        }
      };
var miniGameWindow = null,
    onWinFunction = null;

function createMiniGame(onWinFunc) {
  onWinFunction = onWinFunc;
  // only one game at a time
  if(miniGameWindow == null){
    let game = Math.floor((Math.random() * (gameArchieve.len + 1)));
    switch (game) {
      case 0:
        if (gameArchieve.frogger.hasPlayed) {
          if (!gameArchieve.simonSays.hasPlayed) {
            game = 1;
          }else if (!gameArchieve.alienInvasion.hasPlayed) {
            game = 2;
          }
        }
        break;
      case 1:
        if (gameArchieve.simonSays.hasPlayed) {
          if (!gameArchieve.frogger.hasPlayed) {
            game = 0;
          }else if (!gameArchieve.alienInvasion.hasPlayed) {
            game = 2;
          }
        }
        break;
      case 2:
        if (gameArchieve.alienInvasion.hasPlayed) {
          if (!gameArchieve.simonSays.hasPlayed) {
            game = 1;
          }else if (!gameArchieve.frogger.hasPlayed) {
            game = 0;
          }
        }
        break;
    }
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
    }
  }
}

function openWindow(dir, windowTitle) {
  miniGameWindow = window.open(dir, windowTitle);
  playerInGame = true;
}

function closeWindow(status) {
  if(miniGameWindow == null || miniGameWindow == "undefined") {
    console.log("Something went wrong locating the mini game window!");
    return;
  }
  miniGameWindow.kill();
  miniGameWindow = null;
  playerInGame = null;
}

function openDoor(){
  if(onWinFunction == null){
    console.log("No function recieved creating the minigame");
    return;
  }
  onWinFunction();
}

function runFrogger(){
  openWindow(gameArchieve.frogger.dir, "Frogger - MiniGame");
  gameArchieve.frogger.hasPlayed = true;
}

function runSimonSays(){
  openWindow(gameArchieve.simonSays.dir, "Simon Says - MiniGame");
  gameArchieve.simonSays.hasPlayed = true;

}

function runAlienInvasion(){
  openWindow(gameArchieve.alienInvasion.dir, "Alien Invasion - MiniGame");
  gameArchieve.alienInvasion.hasPlayed = true;

}
