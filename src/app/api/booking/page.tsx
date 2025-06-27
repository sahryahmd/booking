"use client"
import { useRouter } from "next/navigation"

export default function BookingPage() {
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Booking</h1>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {/* ...form dan daftar booking... */}
    </div>
  )
}
