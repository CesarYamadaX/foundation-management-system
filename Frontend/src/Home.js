import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          navigate('/');
          return;
        }

        const response = await fetch(`http://127.0.0.1:5000/user-info?username=${username}`);
        if (response.ok) {
          const data = await response.json();
          if (data.userType === "empleado" || data.userType === "admin") {
            setUserData(data.userData);
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!userData) {
    return <div className="error">No se pudo cargar la información del usuario.</div>;
  }

  return (
    <div className="home-container">
      <h1>Bienvenido, {userData.name}</h1>
      
      <div className="employee-info">
        <h2>Información del Empleado</h2>
        <div className="info-grid">
          <div>
            <label>Número de Empleado:</label>
            <p>{userData.employeeNumber}</p>
          </div>
          <div>
            <label>Correo Electrónico:</label>
            <p>{userData.email}</p>
          </div>
          <div>
            <label>Teléfono:</label>
            <p>{userData.phone}</p>
          </div>
          <div>
            <label>Rol:</label>
            <p>{userData.userType === 'admin' ? 'Administrador' : 'Empleado'}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => navigate('/donors-management')}>
          Gestión de Donantes
        </button>
        <button onClick={() => navigate('/send-reminders')}>
          Enviar Recordatorios
        </button>
      </div>
    </div>
  );
}

export default Home;