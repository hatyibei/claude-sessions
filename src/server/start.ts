import { createWSServer } from "./wsServer";

const raw = parseInt(process.env.WS_PORT || "3001", 10);
const port = Number.isFinite(raw) && raw > 0 && raw < 65536 ? raw : 3001;

const { wss, manager } = createWSServer(port);

function shutdown() {
  console.log("\nShutting down...");
  manager.destroy();
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
