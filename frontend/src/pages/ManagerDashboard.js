import { useEffect, useState } from "react";
import API from "../api/api";

export default function ManagerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [houses, setHouses] = useState([]);
  const [date, setDate] = useState("");

  // Filter bookings by selected date
  const filteredBookings = bookings.filter(b =>
    date ? b.date === date : true
  );

  // Fetch data when component mounts
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [bookingsRes, housesRes] = await Promise.all([
          API.get("/bookings"),
          API.get("/houses")
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

  return (
    <div>
      <h2>Manager Dashboard</h2>

      {/* Date Filter */}
      <div>
        <label>Filter by Date: </label>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)} 
        />
        {date && (
          <button onClick={() => setDate("")} style={{ marginLeft: "10px" }}>
            Clear Filter
          </button>
        )}
      </div>

      <h3>Bookings ({filteredBookings.length})</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
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

      <h3>House Status</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {houses.map((h) => (
          <div key={h._id} style={{ fontSize: "18px" }}>
            House {h.houseNumber} → {h.isOccupied ? "🔴 Occupied" : "🟢 Free"}
          </div>
        ))}
      </div>
    </div>
  );
}