import { useState } from 'react';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from './sordera.png';

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.message === "login success") {
        localStorage.setItem('username', username);
        localStorage.setItem('userType', data.userType);
        localStorage.setItem('userId', data.userId);
        
        if (data.userType === "admin") {
          navigate("/donors-management");
        } else {
          navigate("/dashboard");
        }
      } else {
        alert('Error: Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Error: No se pudo conectar al servidor');
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="company-title">Fundación México sin Sordera A.C.</h1>
        </div>
      </header>
      
      <div className="login-container">
        <h2 className="login-title">Inicio de Sesión</h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>

        <div className="links-container">
          <Link to="/register" className="link">Registrarse</Link>
          <Link to="/forgot-password" className="link">¿Olvidó su contraseña?</Link>
        </div>
      </div>
    </>
  );
}

export default App;