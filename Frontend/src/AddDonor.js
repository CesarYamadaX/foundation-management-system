import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function AddDonor() {
  const [formData, setFormData] = useState({
    donorType: 'individual',
    sector: 'private',
    name: '',
    phone: '',
    email: '',
    address: '',
    socialMedia: '',
    observations: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nombre es requerido';
    if (!formData.phone) newErrors.phone = 'Teléfono es requerido';
    if (!formData.email.includes('@')) newErrors.email = 'Correo inválido';
    if (!formData.address) newErrors.address = 'Dirección es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch('http://127.0.0.1:5000/register-donor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Donante registrado exitosamente');
          navigate('/donors-management');
        } else {
          alert(data.message || 'Error al registrar donante');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
      }
    }
  };

  return (
    <div className="add-donor-form">
      <h1>Agregar Nuevo Donante</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de donante:</label>
          <select name="donorType" value={formData.donorType} onChange={handleChange}>
            <option value="individual">Individual</option>
            <option value="organization">Organización</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sector:</label>
          <select name="sector" value={formData.sector} onChange={handleChange}>
            <option value="public">Público</option>
            <option value="private">Privado</option>
            <option value="ngo">ONG</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nombre del donante:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Teléfono de contacto:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Correo electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Dirección:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <span className="error">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label>Redes sociales:</label>
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleChange}
            placeholder="@usuario"
          />
        </div>

        <div className="form-group">
          <label>Observaciones:</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit">Guardar Donante</button>
          <button type="button" onClick={() => navigate('/donors-management')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDonor;