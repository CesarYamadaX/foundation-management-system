import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Register from './Register';
import Password from './Password';
import Dashboard from './Dashboard';
import DonorsManagement from './DonorsManagement';
import AddDonor from './AddDonor';
import AddDonation from './AddDonation';
import AddInteraction from './AddInteraction';
import DonorDetails from './Donordetails';
import Home from './Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal (login) */}
        <Route path="/" element={<App />} />
        
        {/* Rutas de autenticación */}
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Password />} />
        
        {/* Rutas para empleados/admin */}
        <Route path="/home" element={<Home />} />
        <Route path="/donors-management" element={<DonorsManagement />} />
        <Route path="/add-donor" element={<AddDonor />} />
        <Route path="/donor-details/:id" element={<DonorDetails />} />
        <Route path="/add-donation/:donorId" element={<AddDonation />} />
        <Route path="/add-interaction/:donorId" element={<AddInteraction />} />
        
        {/* Ruta para dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// Componente simple para página no encontrada
function NotFoundPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Página no encontrada</h1>
      <p>La página que estás buscando no existe.</p>
    </div>
  );
}