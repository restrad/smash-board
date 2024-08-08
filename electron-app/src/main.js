const { app, BrowserWindow, dialog } = require("electron/main");
const path = require("node:path");
require("@electron/remote/main").initialize();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 330,
    minWidth: 1000,
    minHeight: 330,
    maxWidth: 1000,
    maxHeight: 492,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  require("@electron/remote/main").enable(mainWindow.webContents);
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

exports.verifyNuke = () =>
  dialog.showMessageBoxSync({
    buttons: ["Yes", "No", "Cancel"],
    message: "Clear all settings?",
  });
