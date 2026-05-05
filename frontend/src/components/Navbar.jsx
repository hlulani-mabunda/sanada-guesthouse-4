import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="navbar">
      <h3 className="navbar__title">Sadana Guesthouse</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

