import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const client = await clientPromise
  const db = client.db()
  const users = db.collection<User>("users")

  const { name, email, password } = body
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: "All fields required" },
      { status: 400 }
    )
  }
  const existing = await users.findOne({ email })
  if (existing) {
    return NextResponse.json(
      { success: false, message: "Email already registered" },
      { status: 400 }
    )
  }
  const hashed = await bcrypt.hash(password, 10)
  const user: User = { name, email, password: hashed, createdAt: new Date() }
  await users.insertOne(user)
  return NextResponse.json({ success: true, message: "User registered" })
}
