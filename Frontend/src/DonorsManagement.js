import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorsManagement.css';

function DonorsManagement() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/donors');
        const data = await response.json();
        setDonors(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching donors:', error);
      }
    };

    fetchDonors();
  }, []);

  const handleAddInteraction = (donorId) => {
    navigate(`/add-interaction/${donorId}`);
  };

  const handleAddDonation = (donorId) => {
    navigate(`/add-donation/${donorId}`);
  };

  const handleExit = () => {
    navigate('/'); // Navega a la página de inicio
  };

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(filter.toLowerCase()) ||
    donor.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando donantes...</div>;

  return (
    <div className="donors-management-container">
      <div className="header-container">
        <h1>Gestión de Donantes</h1>
        <button 
          onClick={handleExit}
          className="exit-button"
        >
          Salir
        </button>
      </div>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Buscar donante..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={() => navigate('/add-donor')}
          className="add-button"
        >
          Agregar Donante
        </button>
      </div>

      <div className="donors-table-container">
        <table className="donors-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Sector</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map(donor => (
              <tr key={donor._id}>
                <td>{donor.name}</td>
                <td>{donor.donorType === 'individual' ? 'Individual' : 'Organización'}</td>
                <td>
                  {donor.sector === 'public' ? 'Público' : 
                   donor.sector === 'private' ? 'Privado' : 'ONG'}
                </td>
                <td>
                  <div>{donor.email}</div>
                  <div>{donor.phone}</div>
                </td>
                <td className="actions">
                  <button 
                    onClick={() => navigate(`/donor-details/${donor._id}`)}
                    className="action-button"
                  >
                    Ver
                  </button>
                  <button 
                    onClick={() => handleAddInteraction(donor._id)}
                    className="action-button"
                  >
                    Interacción
                  </button>
                  <button 
                    onClick={() => handleAddDonation(donor._id)}
                    className="action-button"
                  >
                    Donación
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonorsManagement;