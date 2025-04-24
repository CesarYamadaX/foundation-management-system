import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Interaction.css';

function AddInteraction() {
  const { donorId } = useParams();
  const [formData, setFormData] = useState({
    type: 'call',
    notes: '',
    nextAction: '',
    nextActionDate: ''
  });
  const [donorInfo, setDonorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonorInfo = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/donor/${donorId}`);
        const data = await response.json();
        setDonorInfo(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchDonorInfo();
  }, [donorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId,
          ...formData
        }),
      });

      if (response.ok) {
        alert('Interacción registrada exitosamente');
        navigate(`/donor-details/${donorId}`);
      } else {
        alert('Error al registrar la interacción');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del donante...</div>;
  }

  return (
    <div className="interaction-container">
      <h1>Registrar Interacción con Donante</h1>
      <h2>{donorInfo?.name}</h2>
      
      <form onSubmit={handleSubmit} className="interaction-form">
        <div className="form-group">
          <label>Tipo de Interacción:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="call">Llamada telefónica</option>
            <option value="email">Correo electrónico</option>
            <option value="meeting">Reunión presencial</option>
            <option value="event">Evento</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notas:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Próxima acción requerida:</label>
          <input
            type="text"
            name="nextAction"
            value={formData.nextAction}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha para próxima acción:</label>
          <input
            type="date"
            name="nextActionDate"
            value={formData.nextActionDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Guardar Interacción
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/donor-details/${donorId}`)}
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddInteraction;