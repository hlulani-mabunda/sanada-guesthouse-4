import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar.jsx";

export default function ManagerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [houses, setHouses] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const getBookingEndMs = (booking) => {
    if (!booking?.date || !booking?.time) return null;
    const startMs = new Date(`${booking.date}T${booking.time}`).getTime();
    if (!Number.isFinite(startMs)) return null;

    const duration = Number(booking.duration);
    if (!Number.isFinite(duration) || duration <= 0) return null;

    const durationType = booking.durationType === "days" ? "days" : "hours";
    const durationMs = durationType === "days" ? duration * 24 * 60 * 60 * 1000 : duration * 60 * 60 * 1000;
    return startMs + durationMs;
  };

  // Filter bookings by selected date
  const filteredBookings = bookings.filter((b) => (date ? b.date === date : true));
  const totalRevenue = filteredBookings.reduce((acc, b) => acc + (Number(b.amountPaid) || 0), 0);

  // Fetch data when component mounts
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bookingsRes, housesRes] = await Promise.all([
          API.get("/bookings"),
          API.get("/houses"),
        ]);

        if (!cancelled) {
          setBookings(bookingsRes.data);
          setHouses(housesRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      setDate((prev) => (prev === today ? prev : today));
    }, 60 * 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let intervalId;
    let running = false;

    const autoReleaseExpired = async () => {
      if (running) return;
      running = true;
      try {
        const now = Date.now();
        const releasedKey = "autoReleasedHouseEnds";
        const released = JSON.parse(localStorage.getItem(releasedKey) || "{}");
        const todayKey = new Date().toISOString().slice(0, 10);
        if (released.__date !== todayKey) {
          localStorage.setItem(releasedKey, JSON.stringify({ __date: todayKey }));
        }

        for (const b of bookings) {
          const endMs = getBookingEndMs(b);
          if (!endMs || endMs > now) continue;
          if (released[String(b.houseNumber)]) continue;

          await API.post("/bookings/release", { houseNumber: Number(b.houseNumber) });
          const nextReleased = { ...(JSON.parse(localStorage.getItem(releasedKey) || "{}")), [String(b.houseNumber)]: true, __date: todayKey };
          localStorage.setItem(releasedKey, JSON.stringify(nextReleased));
        }
      } catch (e) {
        console.error("Auto-release failed:", e);
      } finally {
        running = false;
      }
    };

    if (bookings.length > 0) {
      autoReleaseExpired().then(async () => {
        try {
          const housesRes = await API.get("/houses");
          setHouses(housesRes.data);
        } catch (e) {
          console.error("Error refreshing houses:", e);
        }
      });
      intervalId = window.setInterval(autoReleaseExpired, 60 * 1000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [bookings]);

  return (
    <div>
      <Navbar />

      <div className="container">
        <h2>Manager Dashboard</h2>

        <div className="card">
          <h3>Total Revenue (Today)</h3>
          <h1>R {totalRevenue}</h1>
        </div>

        {/* Date Filter */}
        <div className="card">
          <label>Filter by Date: </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="card">
          <h3>Bookings ({filteredBookings.length})</h3>
          <div className="table-scroll">
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>House</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No bookings found {date && `for ${date}`}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.customerName}</td>
                      <td>House {b.houseNumber}</td>
                      <td>{b.date}</td>
                      <td>{b.time}</td>
                      <td>R {b.amountPaid}</td>
                      <td>{b.staff?.name || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>House Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {houses.map((h) => (
              <div key={h._id} style={{ fontSize: "18px" }}>
                House {h.houseNumber} → {h.isOccupied ? "🔴 Occupied" : "🟢 Free"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

