import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Dashboard.css';

const localizer = momentLocalizer(moment);

function Dashboard() {
  const [activeTab, setActiveTab] = useState(null);
  const [user, setUser] = useState({
    initials: 'AU',
    name: 'Administrador',
    role: 'Supervisor',
    avatar: '',
    theme: 'light'
  });
  
  const [events] = useState([
    {
      title: 'Reunión con donantes',
      start: new Date(),
      end: new Date(moment().add(1, 'hours')),
      desc: 'Reunión mensual'
    }
  ]);
  
  const [todayActivities] = useState([
    { id: 1, type: 'call', contact: 'Juan Pérez', details: 'Confirmar asistencia', time: '10:00 AM' }
  ]);
  
  const [reports] = useState([
    { id: 1, title: 'Reporte mensual', type: 'financiero', date: '01/11/2023' }
  ]);
  
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    alert(`Mensaje enviado a ${recipient}: ${message}`);
    setMessage('');
    setRecipient('');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser({...user, avatar: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (theme) => {
    setUser({...user, theme});
    document.body.className = theme;
  };

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="empty-state">
          <h2>Bienvenido al Panel de Control</h2>
          <p>Seleccione una opción del menú para comenzar</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'beneficiarios':
        return <BeneficiariosContent />;
      case 'bitacora':
        return <BitacoraContent />;
      case 'agenda':
        return <AgendaContent />;
      case 'comunicaciones':
        return <ComunicacionesContent />;
      case 'reportes':
        return <ReportesContent />;
      case 'configuracion':
        return <ConfiguracionContent />;
      default:
        return null;
    }
  };

  // Dashboard.js (Parte modificada del panel principal)
  const DashboardContent = () => (
    <div className="tab-content">
      <h2>Panel Principal</h2>
      
      <div className="dashboard-grid">
        {/* Primera columna */}
        <div className="dashboard-column">
          {/* Bloque de métricas */}
          <div className="metrics-grid">
            <div className="metric-card compact primary">
              <i className="fas fa-users"></i>
              <div className="metric-text">
                <h3>Total Beneficiarios</h3>
                <p>1,248</p>
              </div>
            </div>
            
            <div className="metric-card compact secondary">
              <i className="fas fa-calendar-check"></i>
              <div className="metric-text">
                <h3>Actividades Hoy</h3>
                <p>12</p>
              </div>
            </div>
          </div>
  
          {/* Bloque de donaciones */}
          <div className="metric-card compact accent">
            <i className="fas fa-hand-holding-heart"></i>
            <div className="metric-text">
              <h3>Donaciones</h3>
              <p>48</p>
            </div>
          </div>
  
          {/* Bloque de crecimiento */}
          <div className="metric-card compact success">
            <i className="fas fa-chart-line"></i>
            <div className="metric-text">
              <h3>Crecimiento</h3>
              <p>+24%</p>
            </div>
          </div>
        </div>
  
        {/* Segunda columna */}
        <div className="dashboard-column">
          {/* Actividades recientes */}
          <div className="recent-activities compact">
            <h3>Actividades Recientes</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon primary">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="activity-details">
                  <h4>Juan Pérez</h4>
                  <p>Confirmación de donación</p>
                  <span>10:30 AM</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon primary">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="activity-details">
                  <h4>Javier Pérez</h4>
                  <p>Confirmación de donación</p>
                  <span>11:15 AM</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon primary">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="activity-details">
                  <h4>José María</h4>
                  <p>Confirmación de donación</p>
                  <span>02:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BeneficiariosContent = () => {
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showResponsableModal, setShowResponsableModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
    const [currentBeneficiario, setCurrentBeneficiario] = useState(null);
    const navigate = useNavigate();
  
    // Estados para formularios
    const [newBeneficiario, setNewBeneficiario] = useState({
      nombre: '',
      fechaNacimiento: '',
      lugarNacimiento: '',
      sexo: '',
      escolaridad: '',
      ocupacion: '',
      curp: '',
      nss: '',
      afiliacion: '',
      tieneSeguro: 'no',
      companiaSeguros: '',
      estudioSocioeconomico: 'no',
      rangoSocioeconomico: '',
      servicio: ''
    });
  
    const [newResponsable, setNewResponsable] = useState({
      nombre: '',
      parentesco: '',
      telefono: '',
      email: '',
      direccion: ''
    });
  
    // Obtener beneficiarios
    useEffect(() => {
      const fetchBeneficiarios = async () => {
        try {
          const response = await fetch('http://127.0.0.1:5000/beneficiarios');
          const data = await response.json();
          setBeneficiarios(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching beneficiarios:', error);
          setLoading(false);
        }
      };
  
      fetchBeneficiarios();
    }, []);
  
    // Calcular edad
    const calculateAge = (birthDate) => {
      if (!birthDate) return '';
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      return age;
    };
  
    // Manejar cambios en formularios
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewBeneficiario({ ...newBeneficiario, [name]: value });
    };
  
    const handleResponsableChange = (e) => {
      const { name, value } = e.target;
      setNewResponsable({ ...newResponsable, [name]: value });
    };
  
    // Crear nuevo beneficiario
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const beneficiarioToSend = {
          ...newBeneficiario,
          edad: calculateAge(newBeneficiario.fechaNacimiento),
          responsables: []
        };
  
        const response = await fetch('http://127.0.0.1:5000/beneficiarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(beneficiarioToSend)
        });
  
        if (response.ok) {
          const data = await response.json();
          setBeneficiarios([...beneficiarios, data]);
          setShowModal(false);
          resetBeneficiarioForm();
        }
      } catch (error) {
        console.error('Error adding beneficiario:', error);
      }
    };
  
    // Agregar responsable
    const handleAddResponsable = (beneficiarioId) => {
      setSelectedBeneficiario(beneficiarioId);
      setShowResponsableModal(true);
    };
  
    // Enviar nuevo responsable
    const handleResponsableSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/beneficiarios/${selectedBeneficiario}/responsable`, 
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newResponsable)
          }
        );
  
        if (response.ok) {
          const updatedResponse = await fetch('http://127.0.0.1:5000/beneficiarios');
          const updatedData = await updatedResponse.json();
          setBeneficiarios(updatedData);
          setShowResponsableModal(false);
          resetResponsableForm();
          
          // Si estamos viendo detalles, actualizar también ese beneficiario
          if (currentBeneficiario && currentBeneficiario._id === selectedBeneficiario) {
            const beneficiarioResponse = await fetch(`http://127.0.0.1:5000/beneficiarios/${selectedBeneficiario}`);
            const beneficiarioData = await beneficiarioResponse.json();
            setCurrentBeneficiario(beneficiarioData);
          }
        }
      } catch (error) {
        console.error('Error agregando responsable:', error);
      }
    };
  
    // Ver detalles del beneficiario
    const handleViewDetails = async (beneficiarioId) => {
        try {
          console.log(`Intentando obtener detalles para beneficiario ID: ${beneficiarioId}`); // Debug
          
          const response = await fetch(`http://127.0.0.1:5000/beneficiarios/${beneficiarioId}`);
          
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Datos recibidos:', data); // Debug
          
          setCurrentBeneficiario(data);
          setShowDetailModal(true);
          console.log('Modal de detalles debería estar visible ahora'); // Debug
        } catch (error) {
          console.error('Error al obtener detalles del beneficiario:', error);
          // Puedes agregar aquí un mensaje de error al usuario
        }
      };
  
    // Resetear formularios
    const resetBeneficiarioForm = () => {
      setNewBeneficiario({
        nombre: '',
        fechaNacimiento: '',
        lugarNacimiento: '',
        sexo: '',
        escolaridad: '',
        ocupacion: '',
        curp: '',
        nss: '',
        afiliacion: '',
        tieneSeguro: 'no',
        companiaSeguros: '',
        estudioSocioeconomico: 'no',
        rangoSocioeconomico: '',
        servicio: ''
      });
    };
  
    const resetResponsableForm = () => {
      setNewResponsable({
        nombre: '',
        parentesco: '',
        telefono: '',
        email: '',
        direccion: ''
      });
    };
  
    if (loading) return <div className="loading">Cargando beneficiarios...</div>;
  
    return (
      <div className="tab-content">
        <div className="beneficiarios-header">
          <h2>Gestión de Beneficiarios</h2>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Nuevo Beneficiario
          </button>
        </div>
  
        {/* Tabla de beneficiarios */}
        <div className="table-container">
          <table className="beneficiarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Contacto</th>
                <th>Responsables</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {beneficiarios.map((beneficiario) => (
                <tr key={beneficiario._id}>
                  <td>{beneficiario._id.substring(0, 6)}...</td>
                  <td>{beneficiario.nombre}</td>
                  <td>{beneficiario.edad}</td>
                  <td>{beneficiario.sexo}</td>
                  <td>
                    {beneficiario.telefono && <div>Tel: {beneficiario.telefono}</div>}
                    {beneficiario.email && <div>Email: {beneficiario.email}</div>}
                  </td>
                  <td>{beneficiario.responsables?.length || 0}</td>
                  <td className="actions">
                    <button 
                      onClick={() => handleViewDetails(beneficiario._id)}
                      className="action-button detail-button"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => handleAddResponsable(beneficiario._id)}
                      className="action-button add-button"
                    >
                      + Responsable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Modal para nuevo beneficiario */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Nuevo Beneficiario</h3>
                <button className="close-button" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="beneficiario-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre completo:</label>
                    <input
                      type="text"
                      name="nombre"
                      value={newBeneficiario.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de nacimiento:</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={newBeneficiario.fechaNacimiento}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
  
                <div className="form-row">
                  <div className="form-group">
                    <label>Lugar de nacimiento:</label>
                    <input
                      type="text"
                      name="lugarNacimiento"
                      value={newBeneficiario.lugarNacimiento}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Sexo:</label>
                    <select
                      name="sexo"
                      value={newBeneficiario.sexo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
  
                <div className="form-row">
                  <div className="form-group">
                    <label>Escolaridad:</label>
                    <select
                      name="escolaridad"
                      value={newBeneficiario.escolaridad}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="Ninguna">Ninguna</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Preparatoria">Preparatoria</option>
                      <option value="Universidad">Universidad</option>
                      <option value="Posgrado">Posgrado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ocupación:</label>
                    <input
                      type="text"
                      name="ocupacion"
                      value={newBeneficiario.ocupacion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
  
                <div className="form-row">
                  <div className="form-group">
                    <label>CURP:</label>
                    <input
                      type="text"
                      name="curp"
                      value={newBeneficiario.curp}
                      onChange={handleInputChange}
                      required
                      maxLength="18"
                    />
                  </div>
                  <div className="form-group">
                    <label>NSS (Número de Seguro Social):</label>
                    <input
                      type="text"
                      name="nss"
                      value={newBeneficiario.nss}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
  
                <div className="form-row">
                  <div className="form-group">
                    <label>Afilación:</label>
                    <input
                      type="text"
                      name="afiliacion"
                      value={newBeneficiario.afiliacion}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>¿Tiene seguro médico?</label>
                    <select
                      name="tieneSeguro"
                      value={newBeneficiario.tieneSeguro}
                      onChange={handleInputChange}
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  </div>
                </div>
  
                {newBeneficiario.tieneSeguro === 'si' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Compañía de seguros:</label>
                      <input
                        type="text"
                        name="companiaSeguros"
                        value={newBeneficiario.companiaSeguros}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
  
                <div className="form-row">
                  <div className="form-group">
                    <label>¿Estudio socioeconómico?</label>
                    <select
                      name="estudioSocioeconomico"
                      value={newBeneficiario.estudioSocioeconomico}
                      onChange={handleInputChange}
                    >
                      <option value="no">No</option>
                      <option value="si">Sí</option>
                    </select>
                  </div>
                </div>
  
                {newBeneficiario.estudioSocioeconomico === 'si' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Rango socioeconómico:</label>
                        <select
                          name="rangoSocioeconomico"
                          value={newBeneficiario.rangoSocioeconomico}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Bajo">Bajo</option>
                          <option value="Medio bajo">Medio bajo</option>
                          <option value="Medio">Medio</option>
                          <option value="Medio alto">Medio alto</option>
                          <option value="Alto">Alto</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Servicio:</label>
                        <input
                          type="text"
                          name="servicio"
                          value={newBeneficiario.servicio}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </>
                )}
  
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    Guardar Beneficiario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Modal para nuevo responsable */}
        {showResponsableModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Agregar Responsable</h3>
                <button className="close-button" onClick={() => setShowResponsableModal(false)}>×</button>
              </div>
              <form onSubmit={handleResponsableSubmit} className="responsable-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre completo:</label>
                    <input
                      type="text"
                      name="nombre"
                      value={newResponsable.nombre}
                      onChange={handleResponsableChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Parentesco:</label>
                    <input
                      type="text"
                      name="parentesco"
                      value={newResponsable.parentesco}
                      onChange={handleResponsableChange}
                      required
                    />
                  </div>
                </div>
  
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={newResponsable.telefono}
                      onChange={handleResponsableChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={newResponsable.email}
                      onChange={handleResponsableChange}
                    />
                  </div>
                </div>
  
                <div className="form-group">
                  <label>Dirección:</label>
                  <textarea
                    name="direccion"
                    value={newResponsable.direccion}
                    onChange={handleResponsableChange}
                  />
                </div>
  
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowResponsableModal(false)} className="cancel-button">
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button">
                    Guardar Responsable
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Modal de detalles */}
        {showDetailModal && currentBeneficiario && (
          <div className="modal-overlay">
            <div className="modal large-modal">
              <div className="modal-header">
                <h3>Detalles del Beneficiario</h3>
                <button className="close-button" onClick={() => setShowDetailModal(false)}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="beneficiario-info">
                  <h4>Información Personal</h4>
                  <div className="info-grid">
                    <div><strong>Nombre:</strong> {currentBeneficiario.nombre}</div>
                    <div><strong>Edad:</strong> {currentBeneficiario.edad}</div>
                    <div><strong>Sexo:</strong> {currentBeneficiario.sexo}</div>
                    <div><strong>Fecha Nacimiento:</strong> {new Date(currentBeneficiario.fechaNacimiento).toLocaleDateString()}</div>
                    <div><strong>Lugar Nacimiento:</strong> {currentBeneficiario.lugarNacimiento}</div>
                    <div><strong>Escolaridad:</strong> {currentBeneficiario.escolaridad}</div>
                    <div><strong>Ocupación:</strong> {currentBeneficiario.ocupacion}</div>
                    <div><strong>CURP:</strong> {currentBeneficiario.curp}</div>
                    <div><strong>NSS:</strong> {currentBeneficiario.nss || 'N/A'}</div>
                  </div>
  
                  <h4>Información Médica</h4>
                  <div className="info-grid">
                    <div><strong>Afiliación:</strong> {currentBeneficiario.afiliacion || 'N/A'}</div>
                    <div><strong>Seguro Médico:</strong> {currentBeneficiario.tieneSeguro === 'si' ? 'Sí' : 'No'}</div>
                    {currentBeneficiario.tieneSeguro === 'si' && (
                      <div><strong>Compañía:</strong> {currentBeneficiario.companiaSeguros}</div>
                    )}
                  </div>
  
                  {currentBeneficiario.estudioSocioeconomico === 'si' && (
                    <>
                      <h4>Estudio Socioeconómico</h4>
                      <div className="info-grid">
                        <div><strong>Rango:</strong> {currentBeneficiario.rangoSocioeconomico}</div>
                        <div><strong>Servicio:</strong> {currentBeneficiario.servicio || 'N/A'}</div>
                      </div>
                    </>
                  )}
                </div>
  
                <div className="responsables-section">
                  <div className="section-header">
                    <h4>Responsables ({currentBeneficiario.responsables?.length || 0})</h4>
                    <button 
                      onClick={() => {
                        setSelectedBeneficiario(currentBeneficiario._id);
                        setShowDetailModal(false);
                        setShowResponsableModal(true);
                      }} 
                      className="small-add-button"
                    >
                      + Agregar Responsable
                    </button>
                  </div>
                  
                  {currentBeneficiario.responsables?.length > 0 ? (
                    <div className="responsables-list">
                      {currentBeneficiario.responsables.map((responsable, index) => (
                        <div key={index} className="responsable-card">
                          <div className="responsable-header">
                            <h5>{responsable.nombre}</h5>
                            <span className="parentesco-badge">{responsable.parentesco}</span>
                          </div>
                          <div className="responsable-details">
                            <div><strong>Teléfono:</strong> {responsable.telefono}</div>
                            {responsable.email && <div><strong>Email:</strong> {responsable.email}</div>}
                            {responsable.direccion && <div><strong>Dirección:</strong> {responsable.direccion}</div>}
                            <div className="fecha-agregado">
                              Agregado el: {new Date(responsable.fechaAgregado).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-responsables">
                      No hay responsables registrados para este beneficiario
                    </div>
                  )}
                </div>
              </div>
  
              <div className="modal-footer">
                <button onClick={() => setShowDetailModal(false)} className="close-modal-button">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const BitacoraContent = () => {
    const [events, setEvents] = useState([
      {
        title: 'Reunión con donantes',
        start: new Date(),
        end: new Date(moment().add(1, 'hours')),
        desc: 'Reunión mensual'
      }
    ]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
      title: '',
      start: new Date(),
      end: new Date(moment().add(1, 'hours')),
      desc: '',
      contact: ''
    });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewEvent({
        ...newEvent,
        [name]: value
      });
    };
  
    const handleDateChange = (name, date) => {
      setNewEvent({
        ...newEvent,
        [name]: date
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Agregar a la agenda local
        const eventToAdd = {
          title: `${newEvent.title} - ${newEvent.contact}`,
          start: newEvent.start,
          end: newEvent.end,
          desc: newEvent.desc
        };
        
        setEvents([...events, eventToAdd]);
        
        // Enviar al backend
        const response = await fetch('http://127.0.0.1:5000/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventToAdd)
        });
  
        if (response.ok) {
          setShowEventModal(false);
          setNewEvent({
            title: '',
            start: new Date(),
            end: new Date(moment().add(1, 'hours')),
            desc: '',
            contact: ''
          });
        }
      } catch (error) {
        console.error('Error adding event:', error);
      }
    };
  
    return (
      <div className="tab-content">
        <div className="bitacora-header">
          <h2>Bitácora</h2>
          <button 
            className="add-button"
            onClick={() => setShowEventModal(true)}
          >
            Nuevo Evento
          </button>
        </div>
  
        <div className="events-list">
          {events.map((event, index) => (
            <div key={index} className="event-card">
              <div className="event-time">
                {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
              </div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Modal para nuevo evento */}
        {showEventModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Crear Nuevo Evento</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Título:</label>
                  <input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contacto:</label>
                  <input
                    type="text"
                    name="contact"
                    value={newEvent.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha y Hora Inicio:</label>
                  <input
                    type="datetime-local"
                    value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => handleDateChange('start', new Date(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha y Hora Fin:</label>
                  <input
                    type="datetime-local"
                    value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => handleDateChange('end', new Date(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    name="desc"
                    value={newEvent.desc}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEventModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit">Guardar Evento</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Modificar AgendaContent para usar los mismos eventos
  const AgendaContent = () => (
    <div className="tab-content">
      <h2>Agenda</h2>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}  // Usa el mismo estado de eventos
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
    </div>
  );

  const ComunicacionesContent = () => (
    <div className="tab-content">
      <h2>Comunicaciones</h2>
      <form onSubmit={handleSendMessage} className="com-form">
        <div className="form-group">
          <label>Destinatario</label>
          <select 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)}
            required
          >
            <option value="">Seleccionar</option>
            <option value="juan@example.com">Juan Pérez</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit">Enviar Mensaje</button>
      </form>
    </div>
  );

  const ReportesContent = () => (
    <div className="tab-content">
      <h2>Reportes</h2>
      <div className="reports-grid">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <h3>{report.title}</h3>
            <p>Tipo: {report.type}</p>
            <p>Fecha: {report.date}</p>
            <button>Descargar</button>
          </div>
        ))}
      </div>
    </div>
  );

  const ConfiguracionContent = () => (
    <div className="tab-content">
      <h2>Configuración</h2>
      <div className="settings">
        <div className="avatar-upload">
          <div className="avatar-preview">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-initials">{user.initials}</div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarUpload}
          />
        </div>
        <div className="theme-selector">
          <h3>Tema del sistema</h3>
          <div className="theme-options">
            <button 
              className={`light ${user.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Claro
            </button>
            <button 
              className={`dark ${user.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Oscuro
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`dashboard-container ${user.theme}`}>
      <div className="sidebar">
        <div className="logo">
          <h3>Fundación México Sin</h3>
          <h3>Sordera A.C.</h3>
        </div>

        <div className="user-profile">
          {user.avatar ? (
            <img src={user.avatar} alt="User" className="avatar" />
          ) : (
            <div className="avatar-initials">{user.initials}</div>
          )}
          <div className="user-info">
            <h4>{user.name}</h4>
            <p>{user.role}</p>
          </div>
        </div>

        <nav className="main-menu">
          <button 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`menu-item ${activeTab === 'beneficiarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('beneficiarios')}
          >
            Beneficiarios
          </button>
          <button 
            className={`menu-item ${activeTab === 'bitacora' ? 'active' : ''}`}
            onClick={() => setActiveTab('bitacora')}
          >
            Bitácora
          </button>
          <button 
            className={`menu-item ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            Agenda
          </button>
          <button 
            className={`menu-item ${activeTab === 'comunicaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('comunicaciones')}
          >
            Comunicaciones
          </button>
          <button 
            className={`menu-item ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            Reportes
          </button>
          <button 
            className={`menu-item ${activeTab === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveTab('configuracion')}
          >
            Configuración
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;