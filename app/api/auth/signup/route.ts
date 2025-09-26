import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body || {}

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    const existing = await (prisma as any).user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await (prisma as any).user.create({
      data: { name, email, password: hashed, role: "admin" },
      select: { id: true, name: true, email: true, role: true }
    })

    return NextResponse.json({ message: "Signup successful", user }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}


