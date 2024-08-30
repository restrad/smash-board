# Smash-board

## Setup Guide

These are instructions for regular OBS, but I imagine you can do the same with other streaming software:

- Download the corresponding release ZIP file.
- Extract somewhere.
- Drag and drop `smash-board.html` into OBS, or add a new browser source in OBS pointing at the local file.
- If the source looks weird, manually set the source's properties to 1920 width and 1080 height, or set your OBS canvas resolution to 1080p, or make the source fit the screen.
- In the source's properties, change *Use custom frame rate* -> `60` (if streaming at 60fps of course).
- **Also tick** `Refresh browser when scene becomes active`.
- Manage it all with the `Smash-board` executable.
- The interface will also update basic text files with the match info at `assets/texts/simple-texts/` so you can add them to OBS with ease.

### Interface shortcuts

- Press `Enter` to update.
- Press either `F1` or `F2` to increase P1's or P2's score.
- Press `ESC` to clear player info.

### Player presets

- Save presets by clicking on the `Settings` button on the bottom right corner and selecting the player number. ![image](https://github.com/user-attachments/assets/908a1009-109d-494d-9880-9b5850127f02)
- Delete presets by deleting the corresponding JSON file under `assets/texts/player-info`.

---

## Credits

This is an updated version of the [Ultimate Stream Tool](https://github.com/LieutenantL/Ultimate-Stream-Tool) made by [Lt. L](https://twitter.com/lieutenant_l5). This was also inspired by a similar [Ultimate Stream Tool](https://github.com/pokerobybeto/Ultimate-Stream-Tool) made by [Beto](https://twitter.com/pokeroby_beto).
