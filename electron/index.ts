import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain } from "electron";
import { getPort } from "get-port-please";
// import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { spawn } from "child_process";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
      startBackendServer();
    } else {
      try {
        const [nextJSPort, backendPort] = await Promise.all([
          startNextJSServer(),
          startBackendServer(),
        ]);
        console.log("Next.js server started on port:", nextJSPort);
        console.log("Backend server started on port:", backendPort);
        mainWindow.loadURL(`http://localhost:${nextJSPort}`);
      } catch (error) {
        console.error("Error starting servers:", error);
      }
    }
  };

  loadURL();
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30011, 50000] });
    const webDir = join(app.getAppPath(), "frontend");

    // await startServer({
    //   dir: webDir,
    //   isDev: false,
    //   hostname: "localhost",
    //   port: nextJSPort,
    //   customServer: true,
    //   allowRetry: false,
    //   keepAliveTimeout: 5000,
    //   minimalMode: true,
    // });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

const startBackendServer = async () => {
  return new Promise<number>((resolve, reject) => {
    const backendPort = 3001; // 백엔드 서버 포트
    const backendPath = join(app.getAppPath(), "backend", "build", "index.js");

    const backendProcess = spawn("node", [backendPath], {
      env: { ...process.env, PORT: backendPort.toString() },
    });
    console.log("backendProcess");

    backendProcess.stdout.on("data", (data) => {
      console.log(`Backend stdout: ${data}`);
      if (data.toString().includes("서버가")) {
        resolve(backendPort);
      }
    });

    backendProcess.stderr.on("data", (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on("error", (error) => {
      console.error("Failed to start backend server:", error);
      reject(error);
    });

    // 앱이 종료될 때 백엔드 프로세스도 종료
    app.on("window-all-closed", () => {
      backendProcess.kill();
    });
  });
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
