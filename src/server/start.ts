import { randomBytes } from "crypto";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createWSServer } from "./wsServer";

const raw = parseInt(process.env.WS_PORT || "3003", 10);
const port = Number.isFinite(raw) && raw > 0 && raw < 65536 ? raw : 3001;

// Generate auth token and write to .ws-token (read by Next.js API route)
const token = process.env.WS_TOKEN || randomBytes(32).toString("hex");
const tokenPath = resolve(process.cwd(), ".ws-token");
writeFileSync(tokenPath, token, { mode: 0o600 });
console.log(`Auth token written to ${tokenPath}`);

const { wss, manager, cleanup } = createWSServer(port, token);

function shutdown() {
  console.log("\nShutting down...");
  cleanup();
  manager.destroy();
  wss.close(() => {
    console.log("WebSocket server closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
