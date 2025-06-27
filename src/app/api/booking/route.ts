import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Booking } from "@/models/Booking"
import jwt from "jsonwebtoken"
import { ObjectId } from "bson"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

function verifyToken(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth || !auth.startsWith("Bearer ")) return null
  const token = auth.replace("Bearer ", "")
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }
  const client = await clientPromise
  const db = client.db()
  const bookings = db.collection<Booking>("bookings")
  const userBookings = await bookings.find({ userId: user.userId }).toArray()
  return NextResponse.json({ success: true, bookings: userBookings })
}

export async function POST(req: NextRequest) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }
  const body = await req.json()
  const { name, email, date, time, service } = body
  if (!name || !email || !date || !time || !service) {
    return NextResponse.json(
      { success: false, message: "All fields required" },
      { status: 400 }
    )
  }
  const client = await clientPromise
  const db = client.db()
  const bookings = db.collection<Booking>("bookings")
  const booking: Booking = {
    userId: user.userId,
    name,
    email,
    date,
    time,
    service,
    createdAt: new Date(),
  }
  await bookings.insertOne(booking)
  return NextResponse.json({ success: true, booking })
}

export async function PATCH(req: NextRequest) {
  try {
    const user = verifyToken(req)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    const body = await req.json()
    const { id, ...update } = body
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Booking id required" },
        { status: 400 }
      )
    }
    delete update._id
    delete update.userId
    const client = await clientPromise
    const db = client.db()
    const bookings = db.collection<Booking>("bookings")
    let result
    try {
      result = await bookings.findOneAndUpdate(
        { _id: new ObjectId(id), userId: user.userId },
        { $set: update },
        { returnDocument: "after" }
      )
      console.log("PATCH result:", result)
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Update failed", error: String(err) },
        { status: 500 }
      )
    }
    if (result) {
      return NextResponse.json({ success: true, booking: result })
    }
    return NextResponse.json(
      { success: false, message: "Booking not found or not yours" },
      { status: 404 }
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Unexpected error", error: String(err) },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const user = verifyToken(req)
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )
  }
  const body = await req.json()
  const { id } = body
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Booking id required" },
      { status: 400 }
    )
  }
  const client = await clientPromise
  const db = client.db()
  const bookings = db.collection<Booking>("bookings")
  const result = await bookings.deleteOne({
    _id: new ObjectId(id),
    userId: user.userId,
  })
  if (result.deletedCount === 0) {
    return NextResponse.json(
      { success: false, message: "Booking not found or not yours" },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, message: "Booking deleted" })
}
