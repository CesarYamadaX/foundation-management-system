import { useState, useEffect } from 'react';
import './App.css';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el nombre de usuario del localStorage
        const username = localStorage.getItem('username');

        if (!username) {
          navigate('/');
          return;
        }

        // Obtener información del usuario
        const userResponse = await fetch(`http://127.0.0.1:5000/user-info?username=${username}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData.userData);

          // Obtener donaciones e interacciones si es donante
          if (userData.userType === "donante") {
            const donationsRes = await fetch(`http://127.0.0.1:5000/donations?email=${userData.userData.email}`);
            const interactionsRes = await fetch(`http://127.0.0.1:5000/interactions?email=${userData.userData.email}`);
            
            if (donationsRes.ok) setDonations(await donationsRes.json());
            if (interactionsRes.ok) setInteractions(await interactionsRes.json());
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

    fetchData();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!userData) {
    return <div className="error">No se pudo cargar la información.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Bienvenido, {userData.name}</h1>
        <Link to="/edit-profile" className="edit-button">Editar Perfil</Link>
      </div>

      <div className="dashboard-sections">
        {/* Sección de Información Básica */}
        <section className="info-section">
          <h2>Mi Información</h2>
          <div className="info-grid">
            <div>
              <label>Tipo de Donante:</label>
              <p>{userData.donorType === 'individual' ? 'Individual' : 'Organización'}</p>
            </div>
            <div>
              <label>Sector:</label>
              <p>
                {userData.sector === 'public' ? 'Público' : 
                 userData.sector === 'private' ? 'Privado' : 'ONG'}
              </p>
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
              <label>Dirección:</label>
              <p>{userData.address || 'No especificada'}</p>
            </div>
            <div>
              <label>Redes Sociales:</label>
              <p>{userData.socialMedia || 'No especificadas'}</p>
            </div>
          </div>
        </section>

        {/* Sección de Donaciones */}
        <section className="donations-section">
          <h2>Mis Donaciones</h2>
          {donations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation, index) => (
                  <tr key={index}>
                    <td>{new Date(donation.date).toLocaleDateString()}</td>
                    <td>{donation.type === 'monetary' ? 'Monetaria' : 'En especie'}</td>
                    <td>{donation.type === 'monetary' ? `$${donation.amount}` : donation.description}</td>
                    <td>{donation.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay donaciones registradas.</p>
          )}
          <button onClick={() => navigate('/new-donation')} className="action-button">
            Registrar Nueva Donación
          </button>
        </section>

        {/* Sección de Interacciones */}
        <section className="interactions-section">
          <h2>Historial de Contacto</h2>
          {interactions.length > 0 ? (
            <div className="interactions-list">
              {interactions.map((interaction, index) => (
                <div key={index} className="interaction-card">
                  <div className="interaction-header">
                    <span className="interaction-type">
                      {interaction.type === 'call' ? 'Llamada' : 
                       interaction.type === 'email' ? 'Correo' : 'Evento'}
                    </span>
                    <span className="interaction-date">
                      {new Date(interaction.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="interaction-notes">{interaction.notes}</p>
                  {interaction.nextAction && (
                    <div className="next-action">
                      <strong>Próxima acción:</strong> {interaction.nextAction} - 
                      {interaction.nextActionDate ? 
                        new Date(interaction.nextActionDate).toLocaleDateString() : 'Sin fecha'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No hay interacciones registradas.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;