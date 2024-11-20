const path = require("path");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");

// Initialize remote module
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

// Enforce single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (BrowserWindow.getAllWindows().length) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      frame: false,
      titleBarStyle: "hidden",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: true,
      },
      backgroundColor: "#121212",
    });

    // Set Content Security Policy
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' http://localhost:11434 http://localhost:3000; " +
            "img-src 'self' data: http://localhost:11434 http://localhost:3000; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline';"
          ],
        },
      });
    });

    // Enable remote module for this window
    remoteMain.enable(win.webContents);

    // Load the index.html from a url in dev mode, or the local file in prod mode.
    if (isDev) {
      win.loadURL("http://localhost:3000");
    } else {
      // In production, resolve paths relative to the app's root
      win.loadFile(path.join(__dirname, "index.html"));

      // Set base directory for loading resources
      win.webContents.on("did-finish-load", () => {
        win.webContents.executeJavaScript(`
                  const baseElement = document.createElement('base');
                  baseElement.href = 'file://${path
                    .join(__dirname, "/")
                    .replace(/\\/g, "/")}';
                  document.head.prepend(baseElement);
              `);
      });
    }

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

  // Enable remote module for any new windows
  app.on("browser-window-created", (_, window) => {
    remoteMain.enable(window.webContents);
  });
}
