import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export async function GET() {
  const tokenPath = resolve(process.cwd(), ".ws-token");

  if (!existsSync(tokenPath)) {
    return NextResponse.json({ token: null });
  }

  try {
    const token = readFileSync(tokenPath, "utf-8").trim();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ token: null });
  }
}
