import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px",
      background: "#0ea5e9",
      color: "white"
    }}>
      <h3>Sadana Guesthouse</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}