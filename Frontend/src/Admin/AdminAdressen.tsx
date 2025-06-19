import React, { useEffect, useState } from 'react';
import '../StyleCss/AdminAdressen.css';
import { FaHome, FaEnvelope, FaPhone } from 'react-icons/fa';

interface Adresse {
  adresse_id: number;
  bestell_id: number;
  anrede: string;
  vorname: string;
  nachname: string;
  firma?: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  email: string;
  telefon: string;
}

const AdminAdressen: React.FC = () => {
  const [adressen, setAdressen] = useState<Adresse[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/adressen')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setAdressen(data);
        }
      })
      .catch(err => {
        console.error('Fehler beim Laden:', err);
        setError('Fehler beim Laden der Adressen');
      });
  }, []);

  return (
    <div className="adressen-container">
      <h2>Adressenverwaltung</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="adressen-grid">
        {adressen.map(a => (
          <div className="adresse-card" key={a.adresse_id}>
            <p><strong>{a.anrede}</strong> {a.vorname} {a.nachname}</p>
            {a.firma && <p className="firma">Firma: {a.firma}</p>}
            <p><FaHome /> {a.strasse} {a.hausnummer}, {a.plz} {a.ort}</p>
            <p><FaEnvelope /> {a.email}</p>
            <p><FaPhone /> {a.telefon}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAdressen;
