import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json()
  const client = await clientPromise
  const db = client.db()
  const users = db.collection<User>("users")

  if (pathname.endsWith("/register")) {
    // Register user
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
  } else if (pathname.endsWith("/login")) {
    // Login user
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      )
    }
    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      )
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    )
    return NextResponse.json({ success: true, token })
  }

  return NextResponse.json(
    { success: false, message: "Invalid endpoint" },
    { status: 404 }
  )
}
