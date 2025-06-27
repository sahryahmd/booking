"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Booking {
  _id?: string
  name: string
  email: string
  date: string
  time: string
  service: string
}

export default function BookingPage() {
  const [token, setToken] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [form, setForm] = useState<Booking>({
    name: "",
    email: "",
    date: "",
    time: "",
    service: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const t = localStorage.getItem("token")
    setToken(t)
    if (t) fetchBookings(t)
  }, [])

  async function fetchBookings(t: string) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/booking", {
        headers: { Authorization: `Bearer ${t}` },
      })
      const data = await res.json()
      if (data.success) setBookings(data.bookings)
      else setError(data.message || "Gagal mengambil data")
    } catch {
      setError("Gagal mengambil data")
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError("")
    try {
      let body: Record<string, unknown> = { ...form }
      if (editId) {
        body = { id: editId, ...form }
        delete body._id
        delete body.userId
      }
      const res = await fetch("/api/booking", {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ name: "", email: "", date: "", time: "", service: "" })
        setEditId(null)
        fetchBookings(token)
      } else {
        setError(data.message || "Gagal menyimpan data")
      }
    } catch {
      setError("Gagal menyimpan data")
    }
    setLoading(false)
  }

  function handleEdit(b: Booking) {
    setForm({
      name: b.name,
      email: b.email,
      date: b.date,
      time: b.time,
      service: b.service,
    })
    setEditId(b._id || null)
  }

  async function handleDelete(id: string) {
    if (!token) return
    if (!confirm("Yakin hapus booking ini?")) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) fetchBookings(token)
      else setError(data.message || "Gagal menghapus data")
    } catch {
      setError("Gagal menghapus data")
    }
    setLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (!token) {
    return (
      <div className="p-8 text-center">
        Anda harus login untuk mengakses halaman booking.
      </div>
    )
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
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          className="border p-2 w-full"
          placeholder="Nama"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="border p-2 w-full"
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
        />
        <input
          className="border p-2 w-full"
          type="time"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          required
        />
        <input
          className="border p-2 w-full"
          placeholder="Layanan"
          value={form.service}
          onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
          required
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {editId ? "Update" : "Tambah"} Booking
        </button>
        {editId && (
          <button
            type="button"
            className="ml-2 text-sm text-gray-600"
            onClick={() => {
              setEditId(null)
              setForm({ name: "", email: "", date: "", time: "", service: "" })
            }}
          >
            Batal Edit
          </button>
        )}
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div>
        <h2 className="font-semibold mb-2">Daftar Booking</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b._id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div>
                  <div>
                    <b>{b.name}</b> ({b.email})
                  </div>
                  <div>
                    {b.date} {b.time} - {b.service}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600"
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(b._id!)}
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
