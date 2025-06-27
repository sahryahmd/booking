import { ObjectId } from "bson"

export interface Booking {
  _id?: string | ObjectId
  userId: string
  name: string
  email: string
  date: string // ISO date string
  time: string // e.g. '14:00'
  service: string
  createdAt?: Date
}
