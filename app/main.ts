import * as electron from 'electron';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as contextMenu from 'electron-context-menu';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import StaticDataAccess from './services/static-data-access';
import { UserDataAccess } from './services/user-data-access';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const services = [new UserDataAccess(), new StaticDataAccess()];

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width / 2,
    height: size.height / 2,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      allowRunningInsecureContent: (serve) ? true : false,
      webviewTag: true,
      contextIsolation: false
    },
    transparent: true,
    titleBarStyle: 'hidden',
  });

  if (serve) {
    win.webContents.openDevTools();
    require('electron-reload')(__dirname, {
      electron: require(path.join(__dirname, '/../node_modules/electron'))
    });
    win.loadURL(url.format({
      pathname: 'localhost:4200',
      protocol: 'http:',
      slashes: true,
      query: { "dirname": __dirname }
    }));
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true,
      query: { "dirname": __dirname }
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

ipcMain.on('pasco/maximize', (event, windowId) => {
  const browserWindow = windowId ? BrowserWindow.fromId(windowId) : BrowserWindow.fromWebContents(event.sender);
  if (browserWindow?.isMaximizable()) {
    if (browserWindow.isMaximized()) {
      browserWindow.unmaximize();
    } else {
      browserWindow.maximize();
    }
  }
});

ipcMain.on('pasco/minimize', (event, windowId) => {
  const browserWindow = windowId
    ? BrowserWindow.fromId(windowId)
    : BrowserWindow.fromWebContents(event.sender);
  browserWindow?.minimize();
});

ipcMain.on('pasco/close', (event, windowId) => {
  const browserWindow = windowId
    ? BrowserWindow.fromId(windowId)
    : BrowserWindow.fromWebContents(event.sender);
  browserWindow?.close();
});
ipcMain.on('windowMoving', (e, { windowId, mouseX, mouseY }) => {
  // If we're maximized and moving, unmaximize.
  const browserWindow = windowId ? BrowserWindow.fromId(windowId) : BrowserWindow.fromWebContents(e.sender);
  if (browserWindow?.isMaximizable()) {
    if (browserWindow.isMaximized()) {
      browserWindow.unmaximize();
    }
  }

  // Then move the window.
  const { x, y } = electron.screen.getCursorScreenPoint()
  win.setPosition(x - mouseX, y - mouseY)
});

ipcMain.on('windowMoved', () => { });

ipcMain.on('pasco/get-platform', (event) => {
  event.sender.send('pasco/platform', process.platform);
});


try {
  app.commandLine.appendSwitch('disable-site-isolation-trials');

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
      // set context menu in webview
      contextMenu({ window: contents, });
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
