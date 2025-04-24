import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Donation.css';

function AddDonation() {
  const { donorId } = useParams();
  const [formData, setFormData] = useState({
    type: 'monetary',
    amount: '',
    description: '',
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  });
  const [donorInfo, setDonorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
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
        setLoading(false);
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

  const validate = () => {
    const newErrors = {};
    if (formData.type === 'monetary' && !formData.amount) {
      newErrors.amount = 'El monto es requerido para donaciones monetarias';
    }
    if (formData.type === 'kind' && !formData.description) {
      newErrors.description = 'La descripción es requerida para donaciones en especie';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const donationData = {
          type: formData.type,
          date: formData.date,
          receiptNumber: formData.receiptNumber
        };

        if (formData.type === 'monetary') {
          donationData.amount = parseFloat(formData.amount);
          donationData.description = 'Donación monetaria';
        } else {
          donationData.description = formData.description;
          donationData.amount = 0;
        }

        const response = await fetch('http://127.0.0.1:5000/donations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            donorId,
            ...donationData
          }),
        });

        if (response.ok) {
          alert('Donación registrada exitosamente');
          navigate(`/donor-details/${donorId}`);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Error al registrar la donación');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
      }
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del donante...</div>;
  }

  return (
    <div className="donation-container">
      <h1>Registrar Nueva Donación</h1>
      <h2>Donante: {donorInfo?.name}</h2>
      
      <form onSubmit={handleSubmit} className="donation-form">
        <div className="form-group">
          <label>Tipo de Donación:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="monetary">Monetaria</option>
            <option value="kind">En especie</option>
          </select>
        </div>

        {formData.type === 'monetary' && (
          <div className="form-group">
            <label>Monto ($):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>
        )}

        {formData.type === 'kind' && (
          <div className="form-group">
            <label>Descripción (Especie):</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describa los artículos donados"
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Número de Recibo:</label>
          <input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha de Donación:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Registrar Donación
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/donors-management`)}
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDonation;