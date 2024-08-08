const fs = require("node:fs");
const path = require("node:path");
const Mousetrap = require("mousetrap");
const mainProcess = require("@electron/remote").require("./main");

// const mainPath = path.resolve(
//   __dirname,
//   "..",
//   "..",
//   "obs-overlay",
//   "assets",
//   "texts"
// );
// console.log(mainPath);

// const characterPath = path.resolve(
//   __dirname,
//   "..",
//   "..",
//   "obs-overlay",
//   "assets",
//   "characters"
// );

// OSX publish path
const mainPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "assets",
  "texts"
);
const characterPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "assets",
  "characters"
);

// Windows publish path
// const mainPath = path.resolve(
//   process.env.PORTABLE_EXECUTABLE_DIR,
//   "assets",
//   "Texts"
// );
// const charactersPath = path.resolve(
//   process.env.PORTABLE_EXECUTABLE_DIR,
//   "assets",
//   "Characters"
// );

console.log(process.env.PORTABLE_EXECUTABLE_DIR);
console.log(mainPath);
console.log(characterPath);

const bo3Mode = "Bo3",
  bo5Mode = "Bo5",
  singlesMode = 1,
  doublesMode = 2,
  guiSettings = getJson(mainPath + "/interface-info"),
  scoreboardInfo = getJson(mainPath + "/scoreboard-info");

let score,
  currentBestOf,
  gamemodeValue,
  movedSettings = false,
  selectingPresets = false,
  activePlayer = 0,
  currentFocus = -1,
  player1Color = "Red",
  player2Color = "Blue";

const viewport = document.getElementById("viewport");
const overlay = document.getElementById("overlay");
const goBackRegion = document.getElementById("goBack");
const characterRoster = document.getElementById("characterRoster");
const updateBar = document.getElementById("updateBar");

const round = document.getElementById("roundName");
const tournamentName = document.getElementById("tournamentName");
const teamNames = document.getElementsByClassName("teamName");

const forceWLToggle = document.getElementById("forceWLToggle");
const wlContainers = document.getElementsByClassName("wlContainer");

const gamemode = document.getElementById("gamemode");
const singlesModeIcon = document.getElementById("singlesModeIcon");
const doublesModeIcon = document.getElementById("doublesModeIcon");

const players = [
  {
    character: "",
    skin: "",
    info: document.getElementById("player1Info"),
    name: document.getElementById("player1Name"),
    tag: document.getElementById("player1Tag"),
    characterImage: document.getElementById("player1CharacterImage"),
    characterSelector: document.getElementById("player1CharacterSelector"),
    skinSelector: document.getElementById("player1SkinSelector"),
    skinList: document.getElementById(`player1SkinList`),
    mythraSkinList: document.getElementById(`player1MythraSkinList`),
    presets: document.getElementById("player1Presets"),
  },
  {
    character: "",
    skin: "",
    info: document.getElementById("player2Info"),
    name: document.getElementById("player2Name"),
    tag: document.getElementById("player2Tag"),
    characterImage: document.getElementById("player2CharacterImage"),
    characterSelector: document.getElementById("player2CharacterSelector"),
    skinSelector: document.getElementById("player2SkinSelector"),
    skinList: document.getElementById(`player2SkinList`),
    mythraSkinList: document.getElementById(`player2MythraSkinList`),
    presets: document.getElementById("player2Presets"),
  },
  {
    character: "",
    skin: "",
    info: document.getElementById("player3Info"),
    name: document.getElementById("player3Name"),
    tag: document.getElementById("player3Tag"),
    characterImage: document.getElementById("player3CharacterImage"),
    characterSelector: document.getElementById("player3CharacterSelector"),
    skinSelector: document.getElementById("player3SkinSelector"),
    skinList: document.getElementById(`player3SkinList`),
    mythraSkinList: document.getElementById(`player3MythraSkinList`),
    presets: document.getElementById("player3Presets"),
  },
  {
    character: "",
    skin: "",
    info: document.getElementById("player4Info"),
    name: document.getElementById("player4Name"),
    tag: document.getElementById("player4Tag"),
    characterImage: document.getElementById("player4CharacterImage"),
    characterSelector: document.getElementById("player4CharacterSelector"),
    skinSelector: document.getElementById("player4SkinSelector"),
    skinList: document.getElementById(`player4SkinList`),
    mythraSkinList: document.getElementById(`player4MythraSkinList`),
    presets: document.getElementById("player4Presets"),
  },
];

const casters = [
  {
    name: document.getElementById("caster1Name"),
    twitter: document.getElementById("caster1Twitter"),
    twitch: document.getElementById("caster1Twitch"),
  },
  {
    name: document.getElementById("caster2Name"),
    twitter: document.getElementById("caster2Twitter"),
    twitch: document.getElementById("caster2Twitch"),
  },
];

const scores = [
  {
    container: document.getElementById("scoreBox1"),
    text: document.getElementById("scoreText1"),
    color: document.getElementById("player1Color"),
    win1: document.getElementById("player1Win-1"),
    win2: document.getElementById("player1Win-2"),
    win3: document.getElementById("player1Win-3"),
    winnersToggle: document.getElementById("player1Winners"),
    losersToggle: document.getElementById("player1Losers"),
    currentWL: "",
  },
  {
    container: document.getElementById("scoreBox2"),
    text: document.getElementById("scoreText2"),
    color: document.getElementById("player2Color"),
    win1: document.getElementById("player2Win-1"),
    win2: document.getElementById("player2Win-2"),
    win3: document.getElementById("player2Win-3"),
    winnersToggle: document.getElementById("player2Winners"),
    losersToggle: document.getElementById("player2Losers"),
    currentWL: "",
  },
];

const colors = [
  {
    gradient: document.getElementById("player1"),
    container: document.getElementById("player1ColorContainer"),
    dropDown: document.getElementById(`player1DropdownColors`),
  },
  {
    gradient: document.getElementById("player2"),
    container: document.getElementById("player2ColorContainer"),
    dropDown: document.getElementById(`player2DropdownColors`),
  },
];

function init() {
  viewport.style.right = "100%";

  loadScoreboardInfo();
  createCharacterRoster();
  setupColors();
  mapListeners();
  setupCharacterSelectors();
  setupPresetSelectors();

  addSkinIcons(0);
  addSkinIcons(1);
  if (gamemodeValue == doublesMode) {
    addSkinIcons(2);
    addSkinIcons(3);
  }

  setupScore();
  setupWL();
  checkRound();

  if (currentBestOf == bo3Mode) setBo3Mode();
  else setBo5Mode();

  if (gamemodeValue == singlesMode) setSinglesMode();
  else setDoublesGamemode();

  setupKeyboardBindings();
}

function loadScoreboardInfo() {
  gamemodeValue = scoreboardInfo.gamemode;
  currentBestOf = scoreboardInfo.bestOf;
  round.value = scoreboardInfo.round;
  tournamentName.value = scoreboardInfo.tournamentName;

  score = [scoreboardInfo.score[0], scoreboardInfo.score[1]];

  players.forEach((player, index) => {
    player.name.value = scoreboardInfo.player[index].name;
    player.name.index = index;
    player.tag.value = scoreboardInfo.player[index].tag;
    player.character = scoreboardInfo.player[index].character;
    player.skin = scoreboardInfo.player[index].skin;
  });

  casters.forEach(({ name, twitter, twitch }, index) => {
    name.value = scoreboardInfo.caster[index].name;
    twitter.value = scoreboardInfo.caster[index].twitter;
    twitch.value = scoreboardInfo.caster[index].twitch;
  });

  scores.forEach((score, index) => {
    score.currentWL = scoreboardInfo.wl[index];
    score.winnersToggle.index = index;
    score.losersToggle.index = index;
    score.winnersToggle.wlValue = "W";
    score.losersToggle.wlValue = "L";
  });
}

function mapListeners() {
  document
    .getElementById("updateRegion")
    .addEventListener("click", writeScoreboard);
  document
    .getElementById("settingsRegion")
    .addEventListener("click", moveViewport);
  document.getElementById("nukeRegion").addEventListener("click", nuke);
  document.getElementById("nuke").addEventListener("click", nuke);
  document.getElementById("bo3Div").addEventListener("click", setBo3Mode);
  document.getElementById("bo5Div").addEventListener("click", setBo5Mode);
  document.getElementById("gamemode").addEventListener("click", changeGamemode);
  document.getElementById("swapButton").addEventListener("click", swap);
  document
    .getElementById("clearButton")
    .addEventListener("click", clearPlayers);

  document.getElementById("copyMatch").addEventListener("click", copyMatch);
  document
    .getElementById("makePlayer1Preset")
    .addEventListener("click", makePlayer1Preset); // TODO: Rework to take in index
  document
    .getElementById("makePlayer2Preset")
    .addEventListener("click", makePlayer2Preset);
  document
    .getElementById("makePlayer3Preset")
    .addEventListener("click", makePlayer3Preset);
  document
    .getElementById("makePlayer4Preset")
    .addEventListener("click", makePlayer4Preset);

  goBackRegion.addEventListener("click", goBack);
  characterRoster.addEventListener("click", hideCharacterRoster);
  round.addEventListener("input", checkRound);
  forceWLToggle.addEventListener("click", enableWLtoggle);

  players.forEach((player) => {
    player.name.addEventListener("input", checkPlayerPreset);
    player.name.addEventListener("focusin", checkPlayerPreset);

    player.name.addEventListener("input", resizeInput);
    player.tag.addEventListener("input", resizeInput);
  });

  scores.forEach((score, index) => {
    score.winnersToggle.addEventListener("click", changeWL);
    score.losersToggle.addEventListener("click", changeWL);
  });
}

function setupKeyboardBindings() {
  Mousetrap.bind(
    "enter",
    () => {
      if (isPresetOpen()) {
        players.forEach((player) => {
          if (player.presets.style.display == "block" && currentFocus > -1) {
            player.presets
              .getElementsByClassName("finderEntry")
              [currentFocus].click();
          }
        });
      } else {
        writeScoreboard();
        updateBar.style.backgroundColor = "var(--bg3)";
      }
    },
    "keydown"
  );
  Mousetrap.bind(
    "enter",
    () => {
      updateBar.style.backgroundColor = "var(--bg5)";
    },
    "keyup"
  );

  Mousetrap.bind("esc", () => {
    if (movedSettings) {
      goBack();
    } else if (isPresetOpen()) {
      players.forEach((player) => {
        player.presets.style.display = "none";
      });
    } else if (characterRoster.style.opacity == 1) {
      hideCharacterRoster();
    } else {
      clearPlayers();
    }
  });

  Mousetrap.bind("f1", () => {
    giveWin(0);
  });
  Mousetrap.bind("f2", () => {
    giveWin(1);
  });

  Mousetrap.bind("down", () => {
    players.forEach((player) => {
      if (player.presets.style.display == "block") {
        currentFocus++;
        addActive(player.presets.getElementsByClassName("finderEntry"));
      }
    });
  });
  Mousetrap.bind("up", () => {
    players.forEach((player) => {
      if (player.presets.style.display == "block") {
        currentFocus--;
        addActive(player.presets.getElementsByClassName("finderEntry"));
      }
    });
  });
}

//#region Colors
function loadColors(index) {
  for (const color of guiSettings.colorSlots) {
    const colorEntry = document.createElement("div");
    colorEntry.style.display = "flex";
    colorEntry.title = "Also known as " + color.hex;
    colorEntry.className = "colorEntry";

    colorEntry.index = index;
    colorEntry.addEventListener("click", updateColor);

    let label = document.createElement("div");
    label.innerHTML = color.name;

    let sampleColor = document.createElement("div");
    sampleColor.style.width = "13px";
    sampleColor.style.height = "13px";
    sampleColor.style.margin = "5px";
    sampleColor.style.backgroundColor = color.hex;

    colorEntry.appendChild(sampleColor);
    colorEntry.appendChild(label);

    colors[index].dropDown.appendChild(colorEntry);
  }
}

function updateColor() {
  const index = this.index;

  let clickedColor = this.textContent;

  for (const color of guiSettings.colorSlots) {
    if (color.name === clickedColor) {
      colors[index].container.style.backgroundColor = color.hex;
      colors[
        index
      ].gradient.style.backgroundImage = `linear-gradient(to bottom left, ${color.hex}50, #00000000, #00000000)`;

      if (index == 0) {
        player1Color = color.name;
      } else {
        player2Color = color.name;
      }
    }
  }

  this.parentElement.parentElement.blur();
}

function setupColors() {
  loadColors(0);
  loadColors(1);

  colors[0].gradient.style.backgroundImage =
    "linear-gradient(to bottom left, " +
    guiSettings.colorSlots[0].hex +
    "50, #00000000, #00000000)";
  colors[0].container.style.backgroundColor = guiSettings.colorSlots[0].hex;

  colors[1].gradient.style.backgroundImage =
    "linear-gradient(to bottom left, " +
    guiSettings.colorSlots[1].hex +
    "50, #00000000, #00000000)";
  colors[1].container.style.backgroundColor = guiSettings.colorSlots[1].hex;
}
//#endregion

//#region Characters
function createCharacterBlock(index) {
  const newImage = document.createElement("img");
  newImage.id = guiSettings.charactersBase[index];
  newImage.className = "characterInRoster";
  newImage.setAttribute(
    "src",
    characterPath + "/css/" + guiSettings.charactersBase[index] + ".png"
  );
  newImage.addEventListener("click", changeCharacter);

  return newImage;
}

function createCharacterRoster() {
  for (let i = 0; i < 87; i++) {
    if (i < 13) {
      document
        .getElementById("rosterLine1")
        .appendChild(createCharacterBlock(i));
    } else if (i < 26) {
      document
        .getElementById("rosterLine2")
        .appendChild(createCharacterBlock(i));
    } else if (i < 39) {
      document
        .getElementById("rosterLine3")
        .appendChild(createCharacterBlock(i));
    } else if (i < 52) {
      document
        .getElementById("rosterLine4")
        .appendChild(createCharacterBlock(i));
    } else if (i < 65) {
      document
        .getElementById("rosterLine5")
        .appendChild(createCharacterBlock(i));
    } else if (i < 78) {
      document
        .getElementById("rosterLine6")
        .appendChild(createCharacterBlock(i));
    } else {
      document
        .getElementById("rosterLine7")
        .appendChild(createCharacterBlock(i));
    }
  }
}

function openCharacterRoster() {
  activePlayer = this.index;

  characterRoster.style.display = "flex";
  setTimeout(() => {
    characterRoster.style.opacity = 1;
    characterRoster.style.transform = "scale(1)";
  }, 0);
}

function hideCharacterRoster() {
  characterRoster.style.opacity = 0;
  characterRoster.style.transform = "scale(1.2)";
  setTimeout(() => {
    characterRoster.style.display = "none";
  }, 200);
}

function setupCharacterSelectors() {
  players.forEach((player, index) => {
    if (player.character && player.character != "") {
      player.characterSelector?.setAttribute(
        "src",
        characterPath + "/css/" + player.character + ".png"
      );
    } else {
      player.characterSelector?.setAttribute(
        "src",
        characterPath + "/css/Random.png"
      );
    }

    player.characterSelector.index = index;
    player.characterSelector.addEventListener("click", openCharacterRoster);

    changeCharacterImage(player.characterImage, player.character, player.skin);
    player.characterImage.addEventListener("error", () => {
      player.characterImage.setAttribute(
        "src",
        characterPath + "/portraits/Random.png"
      );
    });
  });
}

function changeCharacterImage(
  characterImage,
  character,
  skin = character + "1"
) {
  if (character == "Random" || character == "") {
    characterImage.setAttribute("src", characterPath + "/portraits/Random.png");
  } else {
    characterImage.setAttribute(
      "src",
      characterPath + "/portraits/" + character + "/" + skin + ".png"
    );
  }
}

function changeSkin() {
  skin = this.id;
  playerIndex = this.playerIndex;

  players[playerIndex].skin = skin;
  changeCharacterImage(
    players[playerIndex].characterImage,
    players[playerIndex].character,
    skin
  );
}

function changeCharacter() {
  players[activePlayer].character = this.id;
  players[activePlayer].skin = `${players[activePlayer].character}1`;
  players[activePlayer].characterSelector.setAttribute(
    "src",
    characterPath + "/css/" + players[activePlayer].character + ".png"
  );
  changeCharacterImage(
    players[activePlayer].characterImage,
    players[activePlayer].character
  );
  addSkinIcons(activePlayer);
}

function changeCharacterManual(index, character, skin = character + "1") {
  players[index].character = character;
  players[index].skin = skin;
  players[index].characterSelector.setAttribute(
    "src",
    characterPath + "/css/" + players[index].character + ".png"
  );
  changeCharacterImage(
    players[index].characterImage,
    players[index].character,
    skin
  );
  addSkinIcons(index);
}

function addSkinIcons(playerIndex) {
  const skinList = players[playerIndex].skinList;
  const playerCharacter = players[playerIndex].character;
  const skinSelector = players[playerIndex].skinSelector;

  skinList.innerHTML = "";

  const charInfo = getJson(
    characterPath + "/portraits/" + playerCharacter + "/_Info"
  );

  if (charInfo != undefined) {
    charInfo.skinList.forEach((skin, index) => {
      let newImg = document.createElement("img");
      newImg.className = "skinIcon";
      newImg.id = skin;
      newImg.title = skin;
      newImg.playerIndex = playerIndex;

      newImg.setAttribute(
        "src",
        characterPath + "/stock-icons/" + playerCharacter + "/" + skin + ".png"
      );

      newImg.addEventListener("click", changeSkin);
      skinList.appendChild(newImg);
    });

    const mythraSkinList = players[playerIndex].mythraSkinList;
    skinSelector.style.height = "30px";
    skinList.style.marginTop = "-1px";
    mythraSkinList.innerHTML = "";
  }

  if (skinList.children.length <= 1) {
    skinSelector.style.display = "none";
    skinSelector.style.opacity = 0;
  } else {
    skinSelector.style.display = "flex";
    skinSelector.style.opacity = 1;
  }
}
//#endregion

//#region Score
function setupScore() {
  score.forEach((value, index) => {
    if (value == 1) {
      scores[index].win1.checked = true;
      scores[index].win2.checked = false;
      scores[index].win3.checked = false;
    } else if (value == 2) {
      scores[index].win1.checked = true;
      scores[index].win2.checked = true;
      scores[index].win3.checked = false;
    } else if (value >= 3) {
      scores[index].win1.checked = true;
      scores[index].win2.checked = true;
      scores[index].win3.checked = true;
    }
  });

  scores.forEach((score, index) => {
    score.win1.addEventListener("click", () => {
      score.win2.checked = false;
      score.win3.checked = false;
    });

    score.win2.addEventListener("click", () => {
      score.win1.checked = true;
      score.win3.checked = false;
    });

    score.win3.addEventListener("click", () => {
      score.win1.checked = true;
      score.win2.checked = true;
    });
  });
}

function checkScore(index) {
  let totalScore = 0;

  if (scores[index].win1.checked) {
    totalScore++;
  }
  if (scores[index].win2.checked) {
    totalScore++;
  }
  if (scores[index].win3.checked) {
    totalScore++;
  }

  return totalScore;
}

function setScore(score, index) {
  scores[index].win1.checked = false;
  scores[index].win2.checked = false;
  scores[index].win3.checked = false;

  if (score > 0) {
    scores[index].win1.checked = true;
    if (score > 1) {
      scores[index].win2.checked = true;
      if (score > 2) {
        scores[index].win3.checked = true;
      }
    }
  }
}

function giveWin(index) {
  if (scores[index].win2.checked) {
    scores[index].win3.checked = true;
  } else if (scores[index].win1.checked) {
    scores[index].win2.checked = true;
  } else if (!scores[index].win1.checked) {
    scores[index].win1.checked = true;
  }
}

function setupWL() {
  scores.forEach((score) => {
    if (score.currentWL == "W") {
      score.winnersToggle.style.color = "var(--text1)";
      score.losersToggle.style.color = "var(--text2)";
      score.winnersToggle.style.backgroundImage =
        "linear-gradient(to top, #575757, #00000000)";
      score.losersToggle.style.backgroundImage = "var(--bg4)";
    } else if (score.currentWL == "L") {
      score.losersToggle.style.color = "var(--text1)";
      score.winnersToggle.style.color = "var(--text2)";
      score.losersToggle.style.backgroundImage =
        "linear-gradient(to top, #575757, #00000000)";
      score.winnersToggle.style.backgroundImage = "var(--bg4)";
    }
  });
}

function changeWL() {
  const index = this.index;
  const wlValue = this.wlValue;
  scores[index].currentWL = wlValue;

  if (wlValue == "W") {
    this.style.color = "var(--text1)";
    scores[index].losersToggle.style.color = "var(--text2)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    scores[index].losersToggle.style.backgroundImage = "var(--bg4)";
  } else {
    this.style.color = "var(--text1)";
    scores[index].winnersToggle.style.color = "var(--text2)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    scores[index].winnersToggle.style.backgroundImage = "var(--bg4)";
  }
}

function enableWLtoggle() {
  for (const container of wlContainers) {
    if (forceWLToggle.checked) {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  }

  if (!forceWLToggle.checked) {
    deactivateWL();
  }
}

function deactivateWL() {
  scores.forEach(({ currentWL }) => {
    currentWL = "";
  });

  wlBoxes = document.getElementsByClassName("wlBox");
  for (const box of wlBoxes) {
    box.style.color = "var(--text2)";
    box.style.backgroundImage = "var(--bg4)";
  }
}

function checkRound() {
  if (!forceWLToggle.checked) {
    if (round.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
      scores.forEach(({ wl }) => {});
      for (let i = 0; i < wlContainers.length; i++) {
        wlContainers[i].style.display = "inline";
        if (currentBestOf == bo3Mode) {
          teamNames[0].style.width = "63%";
          teamNames[1].style.width = "63%";
        } else {
          teamNames[0].style.width = "58.2%";
          teamNames[1].style.width = "58.2%";
        }
      }
    } else {
      for (let i = 0; i < wlContainers.length; i++) {
        wlContainers[i].style.display = "none";
        teamNames[0].style.width = "100%";
        teamNames[1].style.width = "100%";
        deactivateWL();
      }
    }
  }
}

function setBo3Mode() {
  const bo3Element = document.getElementById("bo3Div");
  const bo5Element = document.getElementById("bo5Div");

  currentBestOf = bo3Mode;
  scores[0].win3.style.display = "none";
  scores[1].win3.style.display = "none";
  if (wlContainers[0].style.display == "inline") {
    teamNames[0].style.width = "63%";
    teamNames[1].style.width = "63%";
  } else {
    teamNames[0].style.width = "100%";
    teamNames[1].style.width = "100%";
  }

  bo3Element.style.color = "var(--text1)";
  bo3Element.style.backgroundImage =
    "linear-gradient(to top, #575757, #00000000)";
  bo5Element.style.color = "var(--text2)";
  bo5Element.style.backgroundImage = "var(--bg4)";
}

function setBo5Mode() {
  const bo3Element = document.getElementById("bo3Div");
  const bo5Element = document.getElementById("bo5Div");

  currentBestOf = bo5Mode;
  scores[0].win3.style.display = "block";
  scores[1].win3.style.display = "block";
  if (wlContainers[0].style.display == "inline") {
    teamNames[0].style.width = "58.2%";
    teamNames[1].style.width = "58.2%";
  } else {
    teamNames[0].style.width = "100%";
    teamNames[1].style.width = "100%";
  }

  bo5Element.style.color = "var(--text1)";
  bo5Element.style.backgroundImage =
    "linear-gradient(to top, #575757, #00000000)";
  bo3Element.style.color = "var(--text2)";
  bo3Element.style.backgroundImage = "var(--bg4)";
}

function changeGamemode() {
  if (gamemodeValue == singlesMode) setDoublesGamemode();
  else setSinglesMode();
}

function setSinglesMode() {
  gamemodeValue = singlesMode;
  windowResize();

  doublesModeIcon.style.opacity = 1;
  doublesModeIcon.style.left = "17px";
  singlesModeIcon.style.left = "4px";

  for (let i = 1; i < 3; i++) {
    document
      .getElementById("row3-" + i)
      .insertAdjacentElement("afterbegin", wlContainers[i - 1]);
    document
      .getElementById("row3-" + i)
      .insertAdjacentElement("afterbegin", scores[i - 1].container);

    document
      .getElementById("row1-" + i)
      .insertAdjacentElement("afterbegin", players[i - 1].info);
  }

  for (const teamName of teamNames) {
    teamName.style.display = "none";
    teamName.value = "";
  }

  scores.forEach((score) => {
    score.color.style.marginLeft = "0px";
    score.color.style.borderTopLeftRadius = "0px";
    score.color.style.borderBottomLeftRadius = "0px";

    score.text.style.display = "block";
    score.color.style.right = "0px";
    score.color.style.left = "";
    score.container.style.marginLeft = "10px";
  });

  players.forEach((player, index) => {
    player.name.style.borderTopRightRadius = "0px";
    player.name.style.borderBottomRightRadius = "0px";
    player.name.style.maxWidth = "173px";

    player.tag.style.marginLeft = "0px";
    player.tag.style.maxWidth = "70px";

    if (index == 1 || index == 3) {
      player.presets.style.right = "";
      player.presets.style.left = "0px";
    }

    if (index > 1) {
      player.name.value = "";
      player.tag.value = "";
      player.character = "Random";
      player.skin = "Random1";
      player.skinList.innerHTML = "";
      player.skinList.style.display = "none";
      player.mythraSkinList.innerHTML = "";
      player.skinSelector.style.opacity = 0;
      player.skinSelector.style.display = "none";
      player.mythraSkinList.style.display = "none";
      player.characterSelector.style.display = "none";
      player.characterImage.style.display = "none";
      player.info.style.display = "none";
      player.characterSelector.setAttribute(
        "src",
        characterPath + "/css/Random.png"
      );

      changeCharacterImage(player.characterImage, player.character);
    }
  });

  gamemode.setAttribute("title", "Change the gamemode to Doubles");
}

function setDoublesGamemode() {
  gamemodeValue = doublesMode;
  windowResize();

  doublesModeIcon.style.opacity = 0;
  singlesModeIcon.style.left = "11px";
  teamNames[0].style.display = "block";
  teamNames[1].style.display = "block";

  for (let i = 1; i < 3; i++) {
    document
      .getElementById("row1-" + i)
      .insertAdjacentElement("afterbegin", wlContainers[i - 1]);
    document
      .getElementById("row1-" + i)
      .insertAdjacentElement("afterbegin", scores[i - 1].container);

    document
      .getElementById("row1-" + i)
      .insertAdjacentElement("afterbegin", teamNames[i - 1]);

    document
      .getElementById("row2-" + i)
      .insertAdjacentElement("beforeend", players[i - 1].info);
  }

  for (const teamName of teamNames) {
    teamName.style.display = "block";
  }

  scores.forEach((score) => {
    score.color.style.marginLeft = "5px";
    score.color.style.borderTopLeftRadius = "3px";
    score.color.style.borderBottomLeftRadius = "3px";

    score.text.style.display = "none";
    score.color.style.right = "0px";
    score.color.style.left = "";
    score.container.style.marginLeft = "0px";
  });

  players.forEach((player, index) => {
    player.name.style.borderTopRightRadius = "3px";
    player.name.style.borderBottomRightRadius = "3px";
    player.name.style.maxWidth = "94px";

    player.tag.style.marginLeft = "5px";
    player.tag.style.maxWidth = "45px";

    if (index == 1 || index == 3) {
      player.presets.style.right = "0px";
      player.presets.style.left = "";
    }

    if (index > 1) {
      player.characterSelector.style.display = "block";
      player.skinSelector.style.display = "block";
      player.characterImage.style.display = "block";
      player.skinList.style.display = "block";
      player.mythraSkinList.style.display = "block";
      player.info.style.display = "block";

      player.characterSelector.setAttribute(
        "src",
        characterPath + "/css/" + player.character + ".png"
      );

      changeCharacterImage(player.characterImage, player.character);
      addSkinIcons(index);
    }
  });

  gamemode.setAttribute("title", "Change the gamemode to Singles");
}
//#endregion

//#region Players
function setupPresetSelectors() {
  players.forEach((player) => {
    player.presets.addEventListener("mouseenter", () => {
      selectingPresets = true;
    });
    player.presets.addEventListener("mouseleave", () => {
      selectingPresets = false;
    });

    player.name.addEventListener("focusout", () => {
      if (!selectingPresets) {
        player.presets.style.display = "none";
      }
    });
  });
}

function checkPlayerPreset() {
  currentFocus = -1;

  const index = this.index;
  const presetsElement = players[index].presets;

  presetsElement.innerHTML = "";

  if (this.value.length >= 2) {
    const fileNames = fs.readdirSync(mainPath + "/player-info/");
    fileNames.forEach((fileName) => {
      fileName = fileName.substring(0, fileName.length - ".json".length);

      if (
        fileName.toLocaleLowerCase().includes(this.value.toLocaleLowerCase())
      ) {
        presetsElement.style.display = "block";
        const playerInfo = getJson(mainPath + "/player-info/" + fileName);

        playerInfo.characters.forEach((character) => {
          const finderEntry = document.createElement("div");
          finderEntry.className = "finderEntry";
          finderEntry.addEventListener("click", loadPlayerPreset);

          const tagDiv = document.createElement("div");

          if (playerInfo.tag != "") {
            tagDiv.innerHTML = playerInfo.tag;
            tagDiv.className = "presetTag";
          }

          const nameDiv = document.createElement("div");
          nameDiv.innerHTML = playerInfo.name;
          nameDiv.className = "presetName";

          const characterDiv = document.createElement("div");
          characterDiv.innerHTML = character.character;
          characterDiv.className = "presetCharacter";

          finderEntry.index = index;
          finderEntry.tag = playerInfo.tag;
          finderEntry.name = playerInfo.name;
          finderEntry.character = character.character;
          finderEntry.skin = character.skin;

          const characterImageContainer = document.createElement("div");
          characterImageContainer.className = "presetCharacterImageContainer";

          const characterImage = document.createElement("img");
          characterImage.className = "presetCharacterImage";

          if (character.character == "Random" || character.character == "") {
            characterImage.setAttribute(
              "src",
              characterPath + "/stock-icons/Random.png"
            );
          } else {
            characterImage.setAttribute(
              "src",
              characterPath +
                "/stock-icons/" +
                character.character +
                "/" +
                character.skin +
                ".png"
            );
          }

          characterImage.style.left = "0px";
          characterImage.style.top = "-2px";
          characterImage.style.transform = "scale(.8)";

          characterImageContainer.appendChild(characterImage);

          finderEntry.appendChild(tagDiv);
          finderEntry.appendChild(nameDiv);
          finderEntry.appendChild(characterDiv);
          finderEntry.appendChild(characterImageContainer);
          presetsElement.appendChild(finderEntry);
        });
      }
    });
  }
}

function loadPlayerPreset() {
  const index = this.index;

  players[index].tag.value = this.tag;
  changeInputWidth(players[index].tag);

  players[index].name.value = this.name;
  changeInputWidth(players[index].name);

  players[index].character = this.character;
  players[index].skin = this.skin;
  changeCharacterImage(
    players[index].characterImage,
    players[index].character,
    players[index].skin
  );
  players[index].characterSelector.setAttribute(
    "src",
    characterPath + "/css/" + players[index].character + ".png"
  );
  addSkinIcons(index);

  players[index].presets.style.display = "none";
}

function clearPlayers() {
  for (const teamName of teamNames) {
    teamName.value = "";
  }

  players.forEach((player) => {
    player.name.value = "";
    player.tag.value = "";
    changeInputWidth(player.name);
    changeInputWidth(player.tag);

    player.characterSelector.setAttribute(
      "src",
      characterPath + "/css/Random.png"
    );
    player.character = "Random";
    player.skin = "Random1";
    changeCharacterImage(player.characterImage, player.character);

    player.skinList.innerHTML = "";
    player.mythraSkinList.innerHTML = "";
    player.skinSelector.style.opacity = 0;
    player.skinSelector.style.display = "none";
  });

  const checks = document.getElementsByClassName("scoreCheck");
  for (const check of checks) {
    check.checked = false;
  }
}

function isPresetOpen() {
  for (const player of players) {
    if (player.presets.style.display == "block") return true;
  }

  return false;
}

function makePlayer1Preset() {
  makePreset(0);
}

function makePlayer2Preset() {
  makePreset(1);
}

function makePlayer3Preset() {
  makePreset(2);
}

function makePlayer4Preset() {
  makePreset(3);
}

function makePreset(index) {
  const playerInfo = getJson(
    mainPath + "/player-info/" + players[index].name.value
  );

  let playerJson = {};
  if (playerInfo != undefined) {
    const charArr = [];
    const skinArr = [];

    playerInfo.characters.forEach((char) => {
      charArr.push(char.character);
      skinArr.push(char.skin);
    });

    if (
      !(
        charArr.includes(players[index].character) &&
        skinArr.includes(players[index].skin)
      )
    ) {
      charArr.push(players[index].character);
      skinArr.push(players[index].skin);
    }

    playerJson = {
      name: players[index].name.value,
      tag: players[index].tag.value,
      characters: [],
    };

    for (let i = 0; i < charArr.length; i++) {
      playerJson.characters.push({
        character: charArr[i],
        skin: skinArr[i],
      });
    }
  } else if (players[index].name.value != "") {
    playerJson = {
      name: players[index].name.value,
      tag: players[index].tag.value,
      characters: [
        {
          character: players[index].character,
          skin: players[index].skin,
        },
      ],
    };
  }

  const data = JSON.stringify(playerJson, null, 2);
  fs.writeFileSync(
    mainPath + "/player-info/" + players[index].name.value + ".json",
    data
  );
}

function addActive(x) {
  for (let i = 0; i < x.length; i++) {
    x[i].classList.remove("finderEntry-active");
  }

  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;

  x[currentFocus].classList.add("finderEntry-active");
}
//#endregion

//#region Utilities
function getJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path + ".json"));
  } catch (error) {
    return undefined;
  }
}

function moveViewport() {
  if (!movedSettings) {
    viewport.style.right = "140%";
    overlay.style.opacity = "25%";
    goBackRegion.style.display = "block";
    movedSettings = true;
  }
}

function goBack() {
  viewport.style.right = "100%";
  overlay.style.opacity = "100%";
  goBackRegion.style.display = "none";
  movedSettings = false;
}

function resizeInput() {
  changeInputWidth(this);
}

function changeInputWidth(input) {
  input.style.width =
    getTextWidth(
      input.value,
      window.getComputedStyle(input).fontSize +
        " " +
        window.getComputedStyle(input).fontFamily
    ) +
    12 +
    "px";
}

function getTextWidth(text, font) {
  let canvas =
    getTextWidth.canvas ||
    (getTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}

function windowResize() {
  if (gamemodeValue == doublesMode) {
    window.resizeTo(1000, 492);
    document.getElementById("playerRegion").style.height = "312px";
    document.getElementById("playerSeparator").style.height = "312px";
    document.getElementById("settings").style.height = "500px";
    document.getElementById("makePlayer1Preset").style.marginTop = "255px";

    for (
      let i = 0;
      i < document.getElementsByClassName("sideEditor").length;
      i++
    ) {
      document.getElementsByClassName("sideEditor")[i].style.height = "50%";
    }
    for (
      let i = 0;
      i < document.getElementsByClassName("characterImageContainer").length;
      i++
    ) {
      document.getElementsByClassName("characterImageContainer")[
        i
      ].style.paddingTop = "170px";
    }
    for (
      let i = 0;
      i < document.getElementsByClassName("characterImage").length;
      i++
    ) {
      document.getElementsByClassName("characterImage")[i].style.height = "40%";
    }

    players[0].characterImage.style.float = "left";
    players[1].characterImage.style.float = "left";

    characterRoster.style.height = "500px";
  } else {
    window.resizeTo(1000, 300);
    document.getElementById("playerRegion").style.height = "150px";
    document.getElementById("playerSeparator").style.height = "100%";
    document.getElementById("settings").style.height = "300px";
    document.getElementById("makePlayer1Preset").style.marginTop = "95px";

    for (
      let i = 0;
      i < document.getElementsByClassName("sideEditor").length;
      i++
    ) {
      document.getElementsByClassName("sideEditor")[i].style.height = "100%";
    }
    for (
      let i = 0;
      i < document.getElementsByClassName("characterImageContainer").length;
      i++
    ) {
      document.getElementsByClassName("characterImageContainer")[
        i
      ].style.paddingTop = "0px";
    }
    for (
      let i = 0;
      i < document.getElementsByClassName("characterImage").length;
      i++
    ) {
      document.getElementsByClassName("characterImage")[i].style.height =
        "100%";
    }

    players[0].characterImage.style.float = "right";
    players[1].characterImage.style.float = "right";

    characterRoster.style.height = "300px";
  }
}

function nuke() {
  let response = mainProcess.verifyNuke();
  if (response == 0) {
    round.value = "";
    tournamentName.value = "";
    bestOf = bo3Mode;

    casters.forEach((caster) => {
      caster.name.value = "";
      caster.twitter.value = "";
      caster.twitch.value = "";
    });

    if (gamemodeValue == 2) {
      changeGamemode();
    }
    checkRound();
    clearPlayers();
    writeScoreboard();
  }
}

function swapPlayers(index1, index2) {
  const tempName = players[index1].name.value;
  players[index1].name.value = players[index2].name.value;
  players[index2].name.value = tempName;

  const tempTag = players[index1].tag.value;
  players[index1].tag.value = players[index2].tag.value;
  players[index2].tag.value = tempTag;

  changeInputWidth(players[index1].name);
  changeInputWidth(players[index1].tag);
  changeInputWidth(players[index2].name);
  changeInputWidth(players[index2].tag);

  const tempCharacter = players[index1].character;
  const tempSkin = players[index1].skin;

  changeCharacterManual(
    index1,
    players[index2].character,
    players[index2].skin
  );

  changeCharacterManual(index2, tempCharacter, tempSkin);
}

function swap() {
  swapPlayers(0, 1);

  if (gamemodeValue == doublesMode) {
    const teamStore = teamNames[0].value;
    teamNames[0].value = teamNames[1].value;
    teamNames[1].value = teamStore;

    swapPlayers(2, 3);
  }

  if (scores[0].currentWL != "" && scores[1].currentWL != "") {
    const tempWL = scores[0].currentWL;
    scores[0].currentWL = scores[1].currentWL;
    scores[1].currentWL = tempWL;
    setupWL();
  }

  const tempPlayer1Score = checkScore(0);
  const tempPlayer2Score = checkScore(1);
  setScore(tempPlayer2Score, 0);
  setScore(tempPlayer1Score, 1);
}

function copyMatch() {
  let copiedText = "";

  if (players[0].tag.value) {
    copiedText += players[0].tag.value + " | ";
  }
  copiedText += players[0].name.value + "(" + players[0].character + ") Vs ";
  if (players[1].tag.value) {
    copiedText += players[1].tag.value + " | ";
  }
  copiedText += players[1].name.value + "(" + players[1].character + ")";
  copiedText += " - " + round.value + " - " + tournamentName.value;

  navigator.clipboard.writeText(copiedText);
}

function writeScoreboard() {
  let scoreboardJson = {
    player: players.map((player) => {
      return {
        name: player.name.value,
        tag: player.tag.value,
        character: player.character,
        skin: player.skin,
      };
    }),
    teamName: [teamNames[0].value, teamNames[1].value],
    color: [player1Color, player2Color],
    score: [checkScore(0), checkScore(1)],
    wl: scores.map((score) => score.currentWL),
    bestOf: currentBestOf,
    gamemode: gamemodeValue,
    round: round.value,
    tournamentName: tournamentName.value,
    caster: casters.map((caster) => {
      return {
        name: caster.name.value,
        twitter: caster.twitter.value,
        twitch: caster.twitch.value,
      };
    }),
    allowIntro: document.getElementById("allowIntro").checked,
    workshop: false,
    forceHD: false,
    noLoAHD: false,
    forceMM: false,
  };

  const data = JSON.stringify(scoreboardJson, null, 2);
  fs.writeFileSync(mainPath + "/scoreboard-info.json", data);

  fs.writeFileSync(
    mainPath + "/simple-texts/Player 1.txt",
    players[0].name.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Player 2.txt",
    players[1].name.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Player 3.txt",
    players[2].name?.value ?? ""
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Player 4.txt",
    players[3].name?.value ?? ""
  );

  fs.writeFileSync(mainPath + "/simple-texts/Round.txt", round.value);
  fs.writeFileSync(
    mainPath + "/simple-texts/Tournament Name.txt",
    tournamentName.value.toString()
  );

  fs.writeFileSync(mainPath + "/simple-texts/Team 1.txt", teamNames[0].value);
  fs.writeFileSync(mainPath + "/simple-texts/Team 2.txt", teamNames[1].value);

  fs.writeFileSync(
    mainPath + "/simple-texts/Score L.txt",
    checkScore(0).toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Score R.txt",
    checkScore(1).toString()
  );

  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 1 Name.txt",
    casters[0].name.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 1 Twitter.txt",
    casters[0].twitter.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 1 Twitch.txt",
    casters[0].twitch.value.toString()
  );

  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 2 Name.txt",
    casters[1].name.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 2 Twitter.txt",
    casters[1].twitter.value.toString()
  );
  fs.writeFileSync(
    mainPath + "/simple-texts/Caster 2 Twitch.txt",
    casters[1].twitch.value.toString()
  );
}

//#endregion

init();
