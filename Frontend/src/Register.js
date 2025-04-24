import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    userType: "employee", // Por defecto será empleado
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "El nombre de usuario es obligatorio";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    if (formData.password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.name) newErrors.name = "El nombre completo es obligatorio";
    if (!formData.email.includes("@")) newErrors.email = "Correo inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch("http://127.0.0.1:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",  // Este header es crucial
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || "",  // Asegurar que siempre hay un valor
            userType: formData.userType,
            employeeNumber: formData.employeeNumber || ""  // Si es necesario
          }),
        });
  
        const data = await response.json();
        if (response.status === 201) {
          alert("Registro exitoso! Ahora puedes iniciar sesión.");
          navigate("/");
        } else {
          alert(data.message || "Error en el registro");
        }
      } catch (error) {
        console.error("Error en el registro:", error);
        alert("Error en el registro");
      }
    }
  };
  
  return (
    <div className="register-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Registro de Usuario</h2>
        <Link to="/" className="back-button" style={{
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          textDecoration: 'none',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}>
          ← Regresar al Inicio
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="register-form">
        {/* Fila 1: Nombre de usuario y tipo de usuario */}
        <div className="form-row">
          <div className="form-group">
            <label>Nombre de usuario:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>
          <div className="form-group">
            <label>Tipo de usuario:</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Contraseña y confirmar contraseña */}
        <div className="form-row">
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Fila 3: Nombre completo y correo */}
        <div className="form-row">
          <div className="form-group">
            <label>Nombre completo:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label>Correo electrónico:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
        </div>

        {/* Botones de registro y regreso */}
        <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={{ flex: 1, marginRight: '10px' }}>Registrarse</button>
          <Link to="/" className="back-button" style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            textDecoration: 'none',
            borderRadius: '4px',
            border: '1px solid #ccc',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}>
            Cancelar y Regresar
          </Link>
        </div>
      </form>
    </div>
  );
}