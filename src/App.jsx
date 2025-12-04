import { useEffect, useState } from "react";
import api from "./api/client";

function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get("/health");
        setHealth(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to backend");
      }
    };

    fetchHealth();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>MERN Starter</h1>
      {error && <p>{error}</p>}
      {health && (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;
