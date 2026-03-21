import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, companyName } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const tenant = await db.tenant.create({
      data: { name: companyName },
    });

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
