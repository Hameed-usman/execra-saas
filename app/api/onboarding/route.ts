import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId as string;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 400 });
    }

    const body = await req.json();
    const { industry, stage, teamSize, description, goals, competitors, tools } = body;

    await db.startupProfile.upsert({
      where: { tenantId },
      create: {
        tenantId,
        industry: industry ?? "",
        stage: stage ?? "",
        teamSize: teamSize ? Number(teamSize) : null,
        description: description ?? null,
        goals: goals ?? null,
        competitors: competitors ?? null,
        tools: tools ? JSON.stringify(tools) : null,
      },
      update: {
        industry: industry ?? "",
        stage: stage ?? "",
        teamSize: teamSize ? Number(teamSize) : null,
        description: description ?? null,
        goals: goals ?? null,
        competitors: competitors ?? null,
        tools: tools ? JSON.stringify(tools) : null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }
}
