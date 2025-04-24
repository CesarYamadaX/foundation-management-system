import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './DonorDetails.css';

function DonorDetails() {
  const { id } = useParams();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/donor/${id}`);
        const data = await response.json();
        setDonor(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) {
    return <div className="loading">Cargando información del donante...</div>;
  }

  if (!donor) {
    return <div className="error">No se pudo cargar la información del donante.</div>;
  }

  return (
    <div className="donor-details-container">
      <div className="donor-header">
        <h1>Detalles del Donante</h1>
        <Link to="/donors-management" className="back-link">
          Volver a la lista
        </Link>
      </div>

      <div className="donor-info-section">
        <h2>Información Básica</h2>
        <div className="info-grid">
          <div>
            <label>Nombre:</label>
            <p>{donor.name}</p>
          </div>
          <div>
            <label>Tipo:</label>
            <p>{donor.donorType === 'individual' ? 'Individual' : 'Organización'}</p>
          </div>
          <div>
            <label>Sector:</label>
            <p>
              {donor.sector === 'public' ? 'Público' : 
               donor.sector === 'private' ? 'Privado' : 'ONG'}
            </p>
          </div>
          <div>
            <label>Correo:</label>
            <p>{donor.email}</p>
          </div>
          <div>
            <label>Teléfono:</label>
            <p>{donor.phone}</p>
          </div>
          <div>
            <label>Dirección:</label>
            <p>{donor.address}</p>
          </div>
          <div>
            <label>Redes Sociales:</label>
            <p>{donor.socialMedia || 'No especificado'}</p>
          </div>
          <div>
            <label>Observaciones:</label>
            <p>{donor.observations || 'Ninguna'}</p>
          </div>
        </div>
      </div>

      <div className="donor-actions">
        <button 
          onClick={() => navigate(`/add-interaction/${id}`)}
          className="action-button"
        >
          Agregar Interacción
        </button>
        <button 
          onClick={() => navigate(`/add-donation/${id}`)}
          className="action-button"
        >
          Registrar Donación
        </button>
      </div>

      <div className="donations-section">
        <h2>Historial de Donaciones</h2>
        {donor.donations && donor.donations.length > 0 ? (
          <table className="donations-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {donor.donations.map((donation, index) => (
                <tr key={index}>
                  <td>{formatDate(donation.date)}</td>
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
      </div>

      <div className="interactions-section">
        <h2>Historial de Interacciones</h2>
        {donor.interactions && donor.interactions.length > 0 ? (
          <div className="interactions-list">
            {donor.interactions.map((interaction, index) => (
              <div key={index} className="interaction-card">
                <div className="interaction-header">
                  <span className={`interaction-type ${interaction.type}`}>
                    {interaction.type === 'call' ? 'Llamada' : 
                     interaction.type === 'email' ? 'Correo' : 
                     interaction.type === 'meeting' ? 'Reunión' : 'Evento'}
                  </span>
                  <span className="interaction-date">
                    {formatDate(interaction.date)}
                  </span>
                </div>
                <p className="interaction-notes">{interaction.notes}</p>
                {interaction.nextAction && (
                  <div className="next-action">
                    <strong>Próxima acción:</strong> {interaction.nextAction} - 
                    {interaction.nextActionDate ? 
                      formatDate(interaction.nextActionDate) : 'Sin fecha'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No hay interacciones registradas.</p>
        )}
      </div>
    </div>
  );
}

export default DonorDetails;