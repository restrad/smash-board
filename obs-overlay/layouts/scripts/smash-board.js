"use strict";

//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pXMove = 100;
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = 0.3; //(seconds)
const fadeOutTime = 0.2;
let introDelay = 0.8; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const introSize = "85px";
const nameSize = "30px";
const tagSize = "20px";
const nameSizeDubs = "22px";
const tagSizeDubs = "15px";
const roundSize = "19px";
const casterSize = "24px";
const twitterSize = "20px";

//to store the current character info
const pCharInfo = [];

//variables for the twitter/twitch constant change
let socialInt1;
let socialInt2;
let twitter1, twitch1, twitter2, twitch2;
let socialSwitch = true; //true = twitter, false = twitch
const socialInterval = 10000;

const charPath = "assets/characters/";

const bo3Mode = "Bo3";
const bo5Mode = "Bo5";

//color list will be stored here on startup
let colorList;

//to avoid the code constantly running the same method over and over
const pCharPrev = [],
  pSkinPrev = [],
  scorePrev = [],
  colorPrev = [],
  wlPrev = [];
let bestOfPrev, mainMenuPrev, gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;

//svg paths for the colors, 1 for Singles and 2 for Dubs
const colorPath1 =
  "m 0,0 3.818e-5,16.32621 30.04434582,7.358723 2.100135,-0.314192 3.208067,-7.920963 H 162.45181 L 168.33879,0 h -6.96663 l -5.58928,14.381247 H 35.719909 L 41.352445,0 Z";
const colorPath2 =
  "M 0,0 3.818e-5,24.05297 69.267529,23.684933 72.676776,15.449778 H 162.45181 L 168.33879,0 h -6.96663 l -5.58928,14.381247 H 73.044099 L 78.676635,0 Z";

let startup = true;

//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const pTag = document.getElementsByClassName("tags");
const pName = document.getElementsByClassName("names");
const teamNames = document.getElementsByClassName("teamName");
const charImg = document.getElementsByClassName("pCharacter");
const colorImg = document.getElementsByClassName("colors");
const wlImg = document.getElementsByClassName("wlImg");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreAnim = document.getElementsByClassName("scoreVid");
const overlayRound = document.getElementById("overlayRound");
const textRound = document.getElementById("round");
const borderImg = document.getElementsByClassName("border");

async function mainLoop() {
  const scoreboardInfo = await getScoreboardInfo();
  getData(scoreboardInfo);
}

mainLoop();

setInterval(() => {
  mainLoop();
}, 500);

async function getData(scoreboardInfo) {
  const players = scoreboardInfo.player;
  const teamName = scoreboardInfo.teamName;
  const colors = scoreboardInfo.color;

  const scores = scoreboardInfo.score;
  const wl = scoreboardInfo.wl;

  const bestOf = scoreboardInfo.bestOf;
  const gamemode = scoreboardInfo.gamemode;
  const round = scoreboardInfo.round;
  const mainMenu = scoreboardInfo["forceMM"];

  const casters = scoreboardInfo.caster;
  let caster1 = casters[0].name;
  twitter1 = casters[0].twitter;
  twitch1 = casters[0].twitch;
  let caster2 = casters[1].name;
  twitter2 = casters[1].twitter;
  twitch2 = casters[1].twitch;

  // if there is no team name, just display "[Color] Team"
  for (let i = 0; i < maxSides; i++) {
    if (!teamName[i]) teamName[i] = colors[i] + " Team";
  }

  if (startup) {
    const guiSettings = await getGuiSettings();
    colorList = guiSettings?.colorSlots;

    if (scoreboardInfo.allowIntro) {
      document.getElementById("overlayIntro").style.opacity = 1;

      setTimeout(() => {
        const introVid = document.getElementById("introVid");
        introVid.src = "assets/overlay/scoreboard/Intro.webm";
        introVid.play();
      }, 0); //if you need it to start later, change that 0 (and also update the introDelay)

      if (scores[0] + scores[1] == 0) {
        for (let i = 0; i < maxSides; i++) {
          const pIntroEL = document.getElementById("p" + (i + 1) + "Intro");

          if (gamemode == 1) {
            pIntroEL.textContent = players[i].name;
          } else {
            if (teamName[i] == colors[i] + " Team") {
              pIntroEL.textContent =
                players[i].name + " & " + players[i + 2].name;
            } else {
              pIntroEL.textContent = teamName[i];
            }
          }

          pIntroEL.style.fontSize = introSize;
          resizeText(pIntroEL);

          pIntroEL.style.textShadow = "0px 0px 20px " + getHexColor(colors[i]);
        }

        //player 1 name fade in
        gsap.fromTo(
          "#p1Intro",
          { x: -pMove },
          {
            delay: introDelay,
            x: 0,
            opacity: 1,
            ease: "power2.out",
            duration: fadeInTime,
          }
        ); //to

        //same for player 2
        gsap.fromTo(
          "#p2Intro",
          { x: pMove },
          {
            delay: introDelay,
            x: 0,
            opacity: 1,
            ease: "power2.out",
            duration: fadeInTime,
          }
        );
      } else {
        const midTextEL = document.getElementById("midTextIntro");
        if (scores[0] + scores[1] != 4) {
          midTextEL.textContent = "Game " + (scores[0] + scores[1] + 1);
        } else {
          if (round.toUpperCase() == "True Finals".toUpperCase()) {
            midTextEL.textContent = "True Final Game";
          } else {
            midTextEL.textContent = "Final Game";
            if (
              round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() &&
              !(wl[0] == "L" && wl[1] == "L")
            ) {
              gsap.to("#superCoolInterrogation", {
                delay: introDelay + 0.5,
                opacity: 1,
                ease: "power2.out",
                duration: 1.5,
              });
            }
          }
        }
      }

      document.getElementById("roundIntro").textContent = round;
      document.getElementById("tNameIntro").textContent =
        scoreboardInfo.tournamentName;

      //round, tournament and VS/GameX text fade in
      gsap.to(".textIntro", {
        delay: introDelay - 0.2,
        opacity: 1,
        ease: "power2.out",
        duration: fadeInTime,
      });

      //aaaaand fade out everything
      gsap.to("#overlayIntro", {
        delay: introDelay + 1.6,
        opacity: 0,
        ease: "power2.out",
        duration: fadeInTime + 0.2,
      });

      //lets delay everything that comes after this so it shows after the intro
      introDelay = 2.6;
    }

    //if this isnt a singles match, rearrange stuff
    if (gamemode != 1) {
      changeGM(gamemode);
    }
    gamemodePrev = gamemode;

    //this is on top of everything else because the await would desync the rest
    for (let i = 0; i < maxPlayers; i++) {
      //for each available player
      //gets us the character positions for the player
      if (players[i].character === "Random") {
        pCharInfo[i] = "notFound";
      } else {
        pCharInfo[i] = await getCharInfo(players[i].character);
      }
    }

    // now for the actual initialization of players
    for (let i = 0; i < maxPlayers; i++) {
      //lets start with the player names and tags
      updatePlayerName(i, players[i].name, players[i].tag, gamemode);
      //set the starting position for the player text, then fade in and move the text to the next keyframe
      if (gamemode == 1) {
        //if this is singles, fade the names in with a sick motion
        const movement = i % 2 == 0 ? -pMove : pMove; //to know direction
        gsap.fromTo(
          pWrapper[i],
          { x: movement }, //from
          {
            delay: introDelay,
            x: 0,
            opacity: 1,
            ease: "power2.out",
            duration: fadeInTime,
          }
        ); //to
      } else {
        //if doubles, just fade them in
        fadeIn(pWrapper[i], introDelay + 0.15);
      }

      //set the character image for the player
      updateChar(
        players[i].character,
        players[i].skin,
        i,
        pCharInfo[i],
        mainMenu,
        startup
      );
      //when the image finishes loading, it will fade in (coded in updateChar())

      //save the character/skin so we run the character change code only when this doesnt equal to the next
      pCharPrev[i] = players[i].character;
      pSkinPrev[i] = players[i].skin;
    }

    // this will run for each side (so twice)
    for (let i = 0; i < maxSides; i++) {
      //set the team names if not singles
      if (gamemode != 1) {
        updateText(teamNames[i], teamName[i], nameSize);
        const movement = i % 2 == 0 ? -pMove : pMove;
        gsap.fromTo(
          teamName[i],
          { x: movement },
          {
            delay: introDelay,
            x: 0,
            opacity: 1,
            ease: "power2.out",
            duration: fadeInTime,
          }
        );
      }

      //if its grands, we need to show the [W] and/or the [L] on the players
      updateWL(wl[i], i, gamemode);
      if (gamemode == 1) {
        gsap.fromTo(
          wlImg[i], //if singles, move it vertically
          //{x: -pMove*2},
          { y: -pMove }, //set starting position some pixels up (it will be covered by the overlay)
          { delay: introDelay + 0.5, y: 0, ease: "power2.out", duration: 0.5 }
        ); //move down to its default position
      } else {
        const movement = i % 2 == 0 ? -pMove : pMove;
        gsap.fromTo(
          wlImg[i], //if doubles, move it horizontally
          { x: movement * 3 }, //set starting position some pixels up (it will be covered by the overlay)
          { delay: introDelay + 0.5, x: 0, ease: "power2.out", duration: 0.5 }
        ); //move down to its default position
      }
      //save for later so the animation doesn't repeat over and over
      wlPrev[i] = wl[i];

      //set the current score
      updateScore(scores[i], bestOf, colors[i], i, gamemode, false);
      scorePrev[i] = scores[i];

      //set the color
      updateColor(colorImg[i], colors[i]);
      colorPrev[i] = colors[i];
    }

    //update the round text	and fade it in
    updateText(textRound, round, roundSize);
    fadeIn(overlayRound, introDelay);

    //dont forget to update the border if its Bo3 or Bo5!
    updateBorder(bestOf, gamemode);

    //set this for later
    mainMenuPrev = mainMenu;

    //set the caster info
    updateSocialText("caster1N", caster1, casterSize, "caster1TextBox");
    updateSocialText("caster1Tr", twitter1, twitterSize, "caster1TwitterBox");
    updateSocialText("caster1Th", twitch1, twitterSize, "caster1TwitchBox");
    updateSocialText("caster2N", caster2, casterSize, "caster2TextBox");
    updateSocialText("caster2Tr", twitter2, twitterSize, "caster2TwitterBox");
    updateSocialText("caster2Th", twitch2, twitterSize, "caster2TwitchBox");

    //setup twitter/twitch change
    socialChange1("caster1TwitterBox", "caster1TwitchBox");
    socialChange2("caster2TwitterBox", "caster2TwitchBox");
    //set an interval to keep changing the names
    socialInt1 = setInterval(() => {
      socialChange1("caster1TwitterBox", "caster1TwitchBox");
    }, socialInterval);
    socialInt2 = setInterval(() => {
      socialChange2("caster2TwitterBox", "caster2TwitchBox");
    }, socialInterval);

    //keep changing this boolean for the previous intervals
    setInterval(() => {
      if (socialSwitch) {
        //true = twitter, false = twitch
        socialSwitch = false;
      } else {
        socialSwitch = true;
      }
    }, socialInterval);

    //if a caster has no name, hide its icon
    if (caster1 == "") {
      document.getElementById("caster1TextBox").style.opacity = 0;
    }
    if (caster2 == "") {
      document.getElementById("caster2TextBox").style.opacity = 0;
    }

    startup = false; //next time we run this function, it will skip all we just did
  }

  //now things that will happen constantly
  else {
    //of course, check if the gamemode has changed
    if (gamemodePrev != gamemode) {
      changeGM(gamemode);
      updateBorder(bestOf, gamemode);
      for (let i = 0; i < maxSides; i++) {
        updateWL(wl[i], i, gamemode);
      }
      gamemodePrev = gamemode;
    }

    //get the character lists now before we do anything else
    for (let i = 0; i < maxPlayers; i++) {
      //if the character has changed, update the info
      if (pCharPrev[i] != players[i].character) {
        if (players[i].character === "Random") {
          pCharInfo[i] = "notFound";
        } else {
          pCharInfo[i] = await getCharInfo(players[i].character);
        }
      }
    }

    //lets check each player
    for (let i = 0; i < maxPlayers; i++) {
      //player names and tags
      if (
        pName[i].textContent != players[i].name ||
        pTag[i].textContent != players[i].tag
      ) {
        //check the player's side so we know the direction of the movement
        const movement = i % 2 == 0 ? -pMove : pMove;

        //if this is singles, move the texts while updating
        if (gamemode == 1) {
          //move and fade out the player 1's text
          fadeOutMove(pWrapper[i], movement, () => {
            //now that nobody is seeing it, quick, change the text's content!
            updatePlayerName(i, players[i].name, players[i].tag, gamemode);
            //fade the name back in with a sick movement
            fadeInMove(pWrapper[i]);
          });
        } else {
          //if not singles, dont move the texts
          fadeOut(pWrapper[i], () => {
            updatePlayerName(i, players[i].name, players[i].tag, gamemode);
            fadeIn(pWrapper[i]);
          });
        }
      }

      //player characters and skins
      if (
        pCharPrev[i] != players[i].character ||
        pSkinPrev[i] != players[i].skin ||
        mainMenuPrev != mainMenu
      ) {
        //fade out the image while also moving it because that always looks cool
        fadeOutMove(charImg[i], -pCharMove, () => {
          //now that nobody can see it, lets change the image!
          updateChar(
            players[i].character,
            players[i].skin,
            i,
            pCharInfo[i],
            mainMenu
          );
          //will fade in when image finishes loading
        });
        pCharPrev[i] = players[i].character;
        pSkinPrev[i] = players[i].skin;
      }
    }

    //now let's check stuff from each side
    for (let i = 0; i < maxSides; i++) {
      //check if the team names changed
      if (gamemode != 1) {
        const movement = i % 2 == 0 ? -pMove : pMove;

        if (teamName[i].textContent != teamName[i]) {
          fadeOutMove(teamName[i], movement, () => {
            updateText(teamName[i], teamName[i], nameSize);
            fadeInMove(teamName[i]);
          });
        }
      }

      //the [W] and [L] status for grand finals
      if (wlPrev[i] != wl[i]) {
        const movement = i % 2 == 0 ? -pMove : -pMove;
        if (gamemode != 1) {
          movement = i % 2 == 0 ? -pMove : pMove;
        }
        //move it away!
        fadeOutWL(wlImg[i], movement, gamemode, () => {
          //change the thing!
          updateWL(wl[i], i, gamemode);
          //move it back!
          fadeInWL(wlImg[i], gamemode);
        });
        wlPrev[i] = wl[i];
      }

      //score check
      if (scorePrev[i] != scores[i]) {
        updateScore(scores[i], bestOf, colors[i], i, gamemode, true); //if true, animation will play
        scorePrev[i] = scores[i];
      }

      //change the player background colors
      if (colorPrev[i] != colors[i]) {
        updateColor(colorImg[i], colors[i]);
        colorPrev[i] = colors[i];
      }
    }

    //we place this one here so both characters can be updated in one go
    mainMenuPrev = mainMenu;

    //change border depending of the Best Of status
    if (bestOfPrev != bestOf) {
      updateBorder(bestOf, gamemode); //update the border
      //update the score ticks so they fit the bestOf border
      updateScore(scores[0], bestOf, colors[0], 0, gamemode, false);
      updateScore(scores[1], bestOf, colors[1], 1, gamemode, false);
    }

    //and finally, update the round text
    if (textRound.textContent != round) {
      fadeOut(textRound, () => {
        updateText(textRound, round, roundSize);
        fadeIn(textRound);
      });
    }

    //update caster 1 info
    if (document.getElementById("caster1N").textContent != caster1) {
      fadeOut("#caster1TextBox", () => {
        updateSocialText("caster1N", caster1, casterSize, "caster1TextBox");
        //if no caster name, dont fade in the caster icon
        if (caster1 != "") {
          fadeIn("#caster1TextBox", 0.2);
        }
      });
    }
    //caster 1's twitter
    if (document.getElementById("caster1Tr").textContent != twitter1) {
      updateSocial(
        twitter1,
        "caster1Tr",
        "caster1TwitterBox",
        twitch1,
        "caster1TwitchBox"
      );
    }
    //caster 2's twitch (same as above)
    if (document.getElementById("caster1Th").textContent != twitch1) {
      updateSocial(
        twitch1,
        "caster1Th",
        "caster1TwitchBox",
        twitter1,
        "caster1TwitterBox"
      );
    }

    if (twitter1 == "" && twitch1 == "") {
      document.getElementById("caster2").style.bottom = "75px";
    } else {
      document.getElementById("caster2").style.bottom = "50px";
    }

    //caster 2, same as above
    if (document.getElementById("caster2N").textContent != caster2) {
      fadeOut("#caster2TextBox", () => {
        updateSocialText("caster2N", caster2, casterSize, "caster2TextBox");
        if (caster2 != "") {
          fadeIn("#caster2TextBox", 0.2);
        }
      });
    }
    if (document.getElementById("caster2Tr").textContent != twitter2) {
      updateSocial(
        twitter2,
        "caster2Tr",
        "caster2TwitterBox",
        twitch2,
        "caster2TwitchBox"
      );
    }

    if (document.getElementById("caster2Th").textContent != twitch2) {
      updateSocial(
        twitch2,
        "caster2Th",
        "caster2TwitchBox",
        twitter2,
        "caster2TwitterBox"
      );
    }
  }
}

// the gamemode manager
function changeGM(gm) {
  if (gm == 2) {
    maxPlayers = 4;

    //change the positions for the character images
    const charTop = document.getElementsByClassName("charTop");
    for (let i = 0; i < charTop.length; i++) {
      charTop[i].parentElement.classList.remove("maskSingles");
      charTop[i].parentElement.classList.add("maskDubs");
      charTop[i].style.top = "18px";
    }

    //change the positions for the player texts
    for (let i = 0; i < 2; i++) {
      pWrapper[i].classList.remove("wrappersSingles");
      pWrapper[i].classList.add("wrappersDubs");
      pWrapper[i].style.top = "-12px";
      //update the text size and resize it if it overflows
      pName[i].style.fontSize = nameSizeDubs;
      pTag[i].style.fontSize = tagSizeDubs;
      resizeText(pWrapper[i]);
    }
    pWrapper[0].style.left = "410px";
    pWrapper[1].style.right = "410px";

    document.getElementById("p1CharaMask").style.left = "330px";
    document.getElementById("p1Character").style.height = "3.75%";
    document.getElementById("p1Character").style.width = "auto";

    document.getElementById("p2CharaMask").style.left = "1530px";
    document.getElementById("p2Character").style.height = "3.75%";
    document.getElementById("p2Character").style.width = "auto";

    document.getElementById("p3CharaMask").style.left = "330px";
    document.getElementById("p3CharaMask").style.top = "33px";
    document.getElementById("p3Character").style.height = "3.75%";
    document.getElementById("p3Character").style.width = "auto";

    document.getElementById("p4CharaMask").style.left = "1530px";
    document.getElementById("p4CharaMask").style.top = "33px";
    document.getElementById("p4Character").style.height = "3.75%";
    document.getElementById("p4Character").style.width = "auto";

    document.getElementById("wlP1").style.width = "386px";
    document.getElementById("wlP1").style.height = "70px";
    document.getElementById("wlP1").style.left = "-70px";
    document.getElementById("wlP1").style.top = "-12px";

    document.getElementById("wlP2").style.width = "386px";
    document.getElementById("wlP2").style.height = "70px";
    document.getElementById("wlP2").style.right = "-70px";
    document.getElementById("wlP2").style.top = "-12px";

    //change the color paths
    for (let i = 0; i < 2; i++) {
      colorImg[i].firstElementChild.setAttribute("d", colorPath2);
    }

    //show all hidden elements
    const dubELs = document.getElementsByClassName("dubEL");
    for (let i = 0; i < dubELs.length; i++) {
      dubELs[i].style.display = "block";
    }
  } else {
    maxPlayers = 2;

    const charTop = document.getElementsByClassName("charTop");
    for (let i = 0; i < charTop.length; i++) {
      charTop[i].parentElement.classList.remove("maskDubs");
      charTop[i].parentElement.classList.add("maskSingles");
      charTop[i].style.top = "18px";
    }

    for (let i = 0; i < 2; i++) {
      pWrapper[i].classList.remove("wrappersDubs");
      pWrapper[i].classList.add("wrappersSingles");
      pWrapper[i].style.top = "0px";
      pName[i].style.fontSize = nameSize;
      pTag[i].style.fontSize = tagSize;
      resizeText(pWrapper[i]);
    }
    pWrapper[0].style.left = "388px";
    pWrapper[1].style.right = "388px";

    for (let i = 0; i < 2; i++) {
      colorImg[i].firstElementChild.setAttribute("d", colorPath1);
    }

    document.getElementById("p1CharaMask").style.left = "";
    document.getElementById("p1Character").style.height = "";
    document.getElementById("p1Character").style.width = "";

    document.getElementById("p2CharaMask").style.left = "1495px";
    document.getElementById("p2Character").style.height = "";
    document.getElementById("p2Character").style.width = "";

    document.getElementById("p3CharaMask").style.left = "";
    document.getElementById("p3Character").style.height = "";
    document.getElementById("p3Character").style.width = "";

    document.getElementById("p4CharaMask").style.left = "1495px";
    document.getElementById("p4Character").style.height = "";
    document.getElementById("p4Character").style.width = "";

    document.getElementById("wlP1").style.width = "";
    document.getElementById("wlP1").style.height = "";
    document.getElementById("wlP1").style.left = "";
    document.getElementById("wlP1").style.top = "";

    document.getElementById("wlP2").style.width = "";
    document.getElementById("wlP2").style.height = "";
    document.getElementById("wlP2").style.right = "";
    document.getElementById("wlP2").style.top = "";

    const dubELs = document.getElementsByClassName("dubEL");
    for (let i = 0; i < dubELs.length; i++) {
      dubELs[i].style.display = "none";
    }
  }
}

// update functions
function updateScore(pScore, bestOf, pColor, pNum, gamemode, playAnim) {
  let delay = 0;
  if (playAnim) {
    //do we want to play the score up animation?
    //depending on the "bestOf" and the color, change the clip
    scoreAnim[pNum].src =
      "assets/overlay/scoreboard/score/" +
      gamemode +
      "/" +
      bestOf +
      "/" +
      pColor +
      ".webm";
    scoreAnim[pNum].play();
    delay = 200; //add a bit of delay so the score change fits with the vid
  }

  //set timeout to the actual image change so it fits with the animation (if it played)
  setTimeout(() => {
    //change the image depending on the bestOf status and, of course, the current score
    if (
      (bestOf == bo3Mode && pScore == 2) ||
      (bestOf == bo5Mode && pScore == 3) ||
      (bestOf == bo3Mode && pScore == 3)
    ) {
      scoreImg[pNum].style.display = "none";
    } else {
      scoreImg[pNum].style.display = "block";
      scoreImg[pNum].src =
        "assets/overlay/scoreboard/score/Win Tick " +
        bestOf +
        " " +
        pScore +
        ".png";
    }
  }, delay);
}

function updateColor(colorEL, pColor) {
  gsap.to(colorEL, { fill: getHexColor(pColor), duration: fadeInTime });
}

function updateBorder(bestOf, gamemode) {
  for (let i = 0; i < borderImg.length; i++) {
    borderImg[i].src =
      "assets/overlay/scoreboard/Borders/Border " +
      gamemode +
      " " +
      bestOf +
      ".png";
  }
  bestOfPrev = bestOf;
}

//the logic behind the twitter/twitch constant change
function socialChange1(twitterWrapperID, twitchWrapperID) {
  const twitterWrapperEL = document.getElementById(twitterWrapperID);
  const twitchWrapperEL = document.getElementById(twitchWrapperID);

  if (startup) {
    //if first time, set initial opacities so we can read them later
    if (!twitter1 && !twitch1) {
      //if all blank
      twitterWrapperEL.style.opacity = 0;
      twitchWrapperEL.style.opacity = 0;
    } else if (!twitter1 && !!twitch1) {
      //if twitter blank
      twitterWrapperEL.style.opacity = 0;
      twitchWrapperEL.style.opacity = 1;
    } else {
      twitterWrapperEL.style.opacity = 1;
      twitchWrapperEL.style.opacity = 0;
    }
  } else if (!!twitter1 && !!twitch1) {
    if (socialSwitch) {
      fadeOut(twitterWrapperEL, () => {
        fadeIn(twitchWrapperEL, 0);
      });
    } else {
      fadeOut(twitchWrapperEL, () => {
        fadeIn(twitterWrapperEL, 0);
      });
    }
  }
}
//i didnt know how to make it a single function im sorry ;_;
function socialChange2(twitterWrapperID, twitchWrapperID) {
  const twitterWrapperEL = document.getElementById(twitterWrapperID);
  const twitchWrapperEL = document.getElementById(twitchWrapperID);

  if (startup) {
    if (!twitter2 && !twitch2) {
      twitterWrapperEL.style.opacity = 0;
      twitchWrapperEL.style.opacity = 0;
    } else if (!twitter2 && !!twitch2) {
      twitterWrapperEL.style.opacity = 0;
      twitchWrapperEL.style.opacity = 1;
    } else {
      twitterWrapperEL.style.opacity = 1;
      twitchWrapperEL.style.opacity = 0;
    }
  } else if (!!twitter2 && !!twitch2) {
    if (socialSwitch) {
      fadeOut(twitterWrapperEL, () => {
        fadeIn(twitchWrapperEL, 0);
      });
    } else {
      fadeOut(twitchWrapperEL, () => {
        fadeIn(twitterWrapperEL, 0);
      });
    }
  }
}
//function to decide when to change to what
function updateSocial(mainSocial, mainText, mainBox, otherSocial, otherBox) {
  //check if this is for twitch or twitter
  let localSwitch = socialSwitch;
  if (mainText == "caster1Th" || mainText == "caster2Th") {
    localSwitch = !localSwitch;
  }
  //check if this is their turn so we fade out the other one
  if (localSwitch) {
    fadeOut("#" + otherBox, () => {});
  }

  //now do the classics
  fadeOut("#" + mainBox, () => {
    updateSocialText(mainText, mainSocial, twitterSize, mainBox);
    //check if its twitter's turn to show up
    if (otherSocial == "" && mainSocial != "") {
      fadeIn("#" + mainBox, 0.2);
    } else if (localSwitch && mainSocial != "") {
      fadeIn("#" + mainBox, 0.2);
    } else if (otherSocial != "") {
      fadeIn("#" + otherBox, 0.2);
    }
  });
}

function updatePlayerName(pNum, name, tag, gamemode) {
  if (gamemode == 2) {
    pName[pNum].style.fontSize = nameSizeDubs; //set original text size
    pTag[pNum].style.fontSize = tagSizeDubs;
  } else {
    pName[pNum].style.fontSize = nameSize;
    pTag[pNum].style.fontSize = tagSize;
  }
  pName[pNum].textContent = name; //change the actual text
  pTag[pNum].textContent = tag;
  resizeText(pWrapper[pNum]); //resize if it overflows
}

//generic text changer
function updateText(textEL, textToType, maxSize) {
  textEL.style.fontSize = maxSize; //set original text size
  textEL.textContent = textToType; //change the actual text
  resizeText(textEL); //resize it if it overflows
}
//social text changer
function updateSocialText(textID, textToType, maxSize, wrapper) {
  const textEL = document.getElementById(textID);
  textEL.style.fontSize = maxSize; //set original text size
  textEL.textContent = textToType; //change the actual text
  const wrapperEL = document.getElementById(wrapper);
  resizeText(wrapperEL); //resize it if it overflows
}

function updateWL(pWL, pNum, gamemode) {
  //check if winning or losing in a GF, then change image
  if (pWL == "W") {
    wlImg[pNum].src =
      "assets/overlay/scoreboard/WLs/Winners P" +
      (pNum + 1) +
      " " +
      gamemode +
      ".png";
  } else if (pWL == "L") {
    wlImg[pNum].src =
      "assets/overlay/scoreboard/WLs/Losers P" +
      (pNum + 1) +
      " " +
      gamemode +
      ".png";
  } else {
    wlImg[pNum].src = "assets/nothing.png";
  }
}

//fade out
function fadeOut(itemID, funct) {
  gsap.to(itemID, { opacity: 0, duration: fadeOutTime, onComplete: funct });
}

//fade out but with movement
function fadeOutMove(itemID, move, funct) {
  gsap.to(itemID, {
    x: move,
    opacity: 0,
    ease: "power1.in",
    duration: fadeOutTime,
    onComplete: funct,
  });
}

//fade in
function fadeIn(itemID, delayTime = 0.2) {
  gsap.to(itemID, { delay: delayTime, opacity: 1, duration: fadeInTime });
}

//fade in but with movement
function fadeInMove(itemID) {
  gsap.to(itemID, {
    delay: 0.3,
    x: 0,
    opacity: 1,
    ease: "power2.out",
    duration: fadeInTime,
  });
}

//fade in but for the character image
function fadeInChara(charaEL, charScale, startup) {
  if (startup) {
    gsap.fromTo(
      charaEL,
      { x: -pCharMove },
      {
        delay: introDelay + 0.2,
        x: 0,
        opacity: 1,
        ease: "power2.out",
        duration: fadeInTime,
      }
    );
  } else {
    gsap.fromTo(
      charaEL,
      { scale: charScale }, //set scale keyframe so it doesnt scale while transitioning
      { delay: 0.2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime }
    );
  }
}

//movement for the [W]/[L] images
function fadeOutWL(wlEL, move, gamemode, funct) {
  if (gamemode == 1) {
    gsap.to(wlEL, {
      y: move,
      ease: "power1.in",
      duration: 0.5,
      onComplete: funct,
    });
  } else {
    gsap.to(wlEL, {
      x: move * 3,
      ease: "power1.in",
      duration: 0.5,
      onComplete: funct,
    });
  }
}
function fadeInWL(wlEL, gamemode) {
  if (gamemode == 1) {
    gsap.to(wlEL, { delay: 0.1, y: 0, ease: "power2.out", duration: 0.5 });
  } else {
    gsap.to(wlEL, { delay: 0.1, x: 0, ease: "power2.out", duration: 0.5 });
  }
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
  const childrens = textEL.children;
  while (textEL.scrollWidth > textEL.offsetWidth) {
    if (childrens.length > 0) {
      //for tag+player texts
      Array.from(childrens).forEach(function (child) {
        child.style.fontSize = getFontSize(child);
      });
    } else {
      textEL.style.fontSize = getFontSize(textEL);
    }
  }
}

//returns a smaller fontSize for the given element
function getFontSize(textElement) {
  return parseFloat(textElement.style.fontSize.slice(0, -2)) * 0.9 + "px";
}

//so we can get the exact color used by the game!
function getHexColor(color) {
  for (let i = 0; i < colorList.length; i++) {
    if (colorList[i].name == color) {
      return colorList[i].hex;
    }
  }
}

//searches for the main json file
function getScoreboardInfo() {
  return new Promise(function (resolve) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "assets/texts/scoreboard-info.json");
    oReq.send();

    //will trigger when file loads
    function reqListener() {
      resolve(JSON.parse(oReq.responseText));
    }
  });
  //i would gladly have used fetch, but OBS local files wont support that :(
}

//searches for the colors list json file
function getGuiSettings() {
  return new Promise(function (resolve) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "assets/texts/interface-info.json");
    oReq.send();

    function reqListener() {
      resolve(JSON.parse(oReq.responseText));
    }
  });
}

//searches for a json file with character data
function getCharInfo(pCharacter) {
  return new Promise(function (resolve) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.onerror = () => {
      resolve("notFound");
    }; //for obs local file browser sources
    oReq.open("GET", charPath + "Portraits/" + pCharacter + "/_Info.json");
    oReq.send();

    function reqListener() {
      try {
        resolve(JSON.parse(oReq.responseText));
      } catch {
        resolve("notFound");
      } //for live servers
    }
  });
}

//now the complicated "change character image" function!
function updateChar(
  pCharacter,
  pSkin,
  pNum,
  charInfo,
  mainMenu,
  startup = false
) {
  //store so code looks cleaner
  const charEL = charImg[pNum];

  //change the image path depending on the character and skin
  charEL.src = charPath + "stock-icons/" + pCharacter + "/" + pSkin + ".png";

  //             x, y, scale
  let charPos = [10, -20, 0.85];
  //now, check if the character and skin exist in the database down there
  if (charInfo != "notFound") {
  } else {
    //if the character isnt on the database, set positions for the "?" image
    //this condition is used just to position images well on both sides
    charPos[1] = -20;
    charPos[2] = 1;
    if (pNum % 2 == 0) {
      charPos[0] = 15;
      charPos[2] = 1;
    } else {
      charPos[0] = 15;
    }
  }

  //to position the character
  charEL.style.left = charPos[0] + "px";
  charEL.style.top = charPos[1] + "px";
  charEL.style.transform = "scale(" + charPos[2] + ")";

  if (pNum == 1) {
    charEL.style.transform = "scaleY(-1)";
  }

  //this will make the thing wait till the image is fully loaded
  charEL
    .decode()
    .then(
      //when the image loads, fade it in
      fadeInChara(charImg[pNum], charPos[2], startup)
    )
    .catch(() => {
      //if the image fails to load, we will use a placeholder
      charEL.src = charPath + "stock-icons/Random/Random1.png";
      fadeInChara(charImg[pNum], charPos[2], startup);
    });
}
