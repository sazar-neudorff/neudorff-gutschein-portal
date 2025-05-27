// src/App.tsx
import { Routes, Route } from 'react-router-dom';

// Seiten aus src/Pages/ importieren – alles gleich!
import StartPage from './Pages/StartPage';
import OrderPage from './Pages/OrderPage';
import AddressPage from './Pages/AddressPage';
import SummaryPage from './Pages/SummaryPage';
import ConfirmationPage from './Pages/ConfirmationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/auswahl" element={<OrderPage />} />
      <Route path="/adresse" element={<AddressPage />} />
      <Route path="/zusammenfassung" element={<SummaryPage />} />  {/* ✅ NEU */}
      <Route path="/bestaetigung" element={<ConfirmationPage />} />
    </Routes>
  );
}
export default App;