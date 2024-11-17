const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
require("@electron/remote/main").initialize();

// Disable GPU acceleration to prevent issues
app.disableHardwareAcceleration();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
    backgroundColor: "#121212",
  });

  require("@electron/remote/main").enable(win.webContents);

  // Load the index.html from a url in dev mode, or the local file in prod mode.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools in development mode.
  if (isDev) {
    win.webContents.openDevTools();
  }

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle errors
  win.webContents.on("crashed", () => {
    console.log("Window crashed!");
  });

  win.on("unresponsive", () => {
    console.log("Window became unresponsive!");
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle any uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// Enable remote module
app.on("browser-window-created", (_, window) => {
  require("@electron/remote/main").enable(window.webContents);
});
