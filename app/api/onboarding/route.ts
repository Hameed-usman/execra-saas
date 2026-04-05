import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log("[ONBOARDING_SESSION]", { user: session?.user });

    if (!session?.user) {
      console.error("[ONBOARDING_ERROR] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId as string;
    if (!tenantId) {
      console.error("[ONBOARDING_ERROR] Tenant not found in session", { user: session.user });
      return NextResponse.json({ error: "Tenant not found in session" }, { status: 400 });
    }

    const body = await req.json();
    console.log("[ONBOARDING_BODY]", { tenantId, body });
    
    const { industry, stage, teamSize, description, goals, competitors, tools } = body;

    // Validate required fields
    if (!industry || !stage) {
      console.error("[ONBOARDING_ERROR] Missing required fields", { industry, stage });
      return NextResponse.json({ error: "Industry and Stage are required" }, { status: 400 });
    }

    const startupProfile = await db.startupProfile.upsert({
      where: { tenantId },
      create: {
        tenantId,
        industry: industry || "",
        stage: stage || "",
        teamSize: teamSize ? parseInt(teamSize as string) : null,
        description: description || null,
        goals: goals || null,
        competitors: competitors || null,
        tools: tools ? JSON.stringify(tools) : null,
      },
      update: {
        industry: industry || "",
        stage: stage || "",
        teamSize: teamSize ? parseInt(teamSize as string) : null,
        description: description || null,
        goals: goals || null,
        competitors: competitors || null,
        tools: tools ? JSON.stringify(tools) : null,
      },
    });

    console.log("[ONBOARDING_SUCCESS]", { profileId: startupProfile.id });
    return NextResponse.json({ success: true, profileId: startupProfile.id }, { status: 200 });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save onboarding data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
