import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    await client.db().admin().ping()
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful!",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: String(error),
      },
      { status: 500 }
    )
  }
}
