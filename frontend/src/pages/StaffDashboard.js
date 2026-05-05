import { useState, useEffect } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function StaffDashboard() {
  const [houses, setHouses] = useState([]);
  const [bookings, setBookings] = useState([]);   // ← Added this state
  const [form, setForm] = useState({
    customerName: "",
    houseNumber: "",
    date: "",
    time: "",
    duration: "",
    durationType: "hours",
    amountPaid: ""
  });

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const fetchHouses = async () => {
    try {
      const res = await API.get("/houses");
      setHouses(res.data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings");
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Calculate total revenue
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.amountPaid || 0), 0);

  // Fetch houses and bookings on component mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [housesRes, bookingsRes] = await Promise.all([
          API.get("/houses"),
          API.get("/bookings")
        ]);

        if (!cancelled) {
          setHouses(housesRes.data);
          setBookings(bookingsRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBooking = async () => {
    if (!form.customerName || !form.houseNumber || !form.date || !form.time || !form.duration || !form.amountPaid) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await API.post("/bookings", {
        ...form,
        houseNumber: Number(form.houseNumber),
        duration: Number(form.duration),
        amountPaid: Number(form.amountPaid),
        staff: user._id
      });

      alert("✅ Booking created successfully!");
      
      // Reset form
      setForm({
        customerName: "",
        houseNumber: "",
        date: "",
        time: "",
        duration: "",
        durationType: "hours",
        amountPaid: ""
      });

      fetchHouses();
      fetchBookings();        // Refresh bookings to update revenue
    } catch (error) {
      console.error(error);
      alert("❌ Booking failed. Please try again.");
    }
  };

  const releaseHouse = async (houseNumber) => {
    if (!window.confirm(`Release House ${houseNumber}?`)) return;

    try {
      await API.post("/bookings/release", { houseNumber });
      alert(`✅ House ${houseNumber} released successfully`);
      fetchHouses();
      fetchBookings();        // Refresh bookings after release
    } catch (error) {
      console.error(error);
      alert("❌ Failed to release house");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container">
        <h2>Staff Dashboard</h2>

        {/* Total Revenue Card */}
        <div className="card">
          <h3>Total Revenue</h3>
          <h1>R {totalRevenue}</h1>
        </div>

        {/* Create Booking Card */}
        <div className="card">
          <h3>Create Booking</h3>

          <input
            placeholder="Customer Name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />

          <select
            value={form.houseNumber}
            onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
          >
            <option value="">Select House</option>
            {houses.map((h) => (
              <option key={h._id} value={h.houseNumber}>
                House {h.houseNumber} ({h.isOccupied ? "Occupied" : "Free"})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <input
            type="number"
            placeholder="Duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />

          <select
            value={form.durationType}
            onChange={(e) => setForm({ ...form, durationType: e.target.value })}
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>

          <input
            type="number"
            placeholder="Amount Paid"
            value={form.amountPaid}
            onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
          />

          <button onClick={handleBooking}>Create Booking</button>
        </div>

        {/* Occupied Houses / Release Card */}
        <div className="card">
          <h3>Occupied Houses</h3>
          {houses.filter(h => h.isOccupied).length === 0 ? (
            <p>No occupied houses at the moment.</p>
          ) : (
            houses.map((h) =>
              h.isOccupied && (
                <div key={h._id} className="release-item">
                  <span>House {h.houseNumber}</span>
                  <button onClick={() => releaseHouse(h.houseNumber)}>
                    Release
                  </button>
                </div>
              )
            )
          )}
        </div>
        <div className="card">
  <h3>House Status</h3>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px"
  }}>
    {houses.map(h => (
      <div key={h._id} style={{
        padding: "10px",
        borderRadius: "8px",
        background: h.isOccupied ? "#ef4444" : "#22c55e",
        color: "white",
        textAlign: "center"
      }}>
        House {h.houseNumber}
      </div>
    ))}
  </div>
</div>

        {/* Bookings List Card */}
        <div className="card">
          <h3>Bookings</h3>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>House</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.customerName}</td>
                    <td>House {booking.houseNumber}</td>
                    <td>{booking.date}</td>
                    <td>R {booking.amountPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}