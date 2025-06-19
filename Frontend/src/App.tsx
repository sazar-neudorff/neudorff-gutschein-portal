// src/App.tsx
import { Routes, Route } from 'react-router-dom';

// Seiten aus src/Pages/ importieren – alles gleich!
import StartPage from './Pages/StartPage';
import OrderPage from './Pages/OrderPage';
import AddressPage from './Pages/AddressPage';
import SummaryPage from './Pages/SummaryPage';
import ConfirmationPage from './Pages/ConfirmationPage';
import AdminDashboard from './Admin/AdminDashboard';
import AdminBestand from './Admin/AdminBestand';
import AdminProdukte from './Admin/AdminProdukte';
import AdminAdminBestellungen from './Admin/AdminBestellungen';
import AdminStatistiken from './Admin/AdminStatistiken';
import AdminAdressen from './Admin/AdminAdressen';
import AdminBestellungNeu from './Admin/AdminBestellungNeu';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/auswahl" element={<OrderPage />} />
      <Route path="/adresse" element={<AddressPage />} />
      <Route path="/zusammenfassung" element={<SummaryPage />} />  {/* ✅ NEU */}
      <Route path="/bestaetigung" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/bestand" element={<AdminBestand />} />
      <Route path="/admin/produkte" element={<AdminProdukte />} />
      <Route path="/admin/bestellungen" element={<AdminAdminBestellungen />} />
      <Route path="/admin/statistik" element={<AdminStatistiken />} />
      <Route path="/admin/adressen" element={<AdminAdressen />} />
      <Route path="/admin/bestellung" element={<AdminBestellungNeu />} />
    </Routes>
  );
}
export default App;