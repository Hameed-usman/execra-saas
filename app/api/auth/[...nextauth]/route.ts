import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

const { GET: authGET, POST: authPOST } = handlers;

export async function GET(request: NextRequest) {
  return authGET(request);
}

export async function POST(request: NextRequest) {
  return authPOST(request);
}
