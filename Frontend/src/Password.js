import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Ingrese un correo electrónico válido");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage(data.message); // Mostrar el mensaje de éxito
      } else {
        setError(data.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default ForgotPassword;