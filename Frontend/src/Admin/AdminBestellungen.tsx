import { useEffect, useState } from 'react';
import '../StyleCss/AdminBestellungen.css';

interface Bestellung {
  bestell_id: string;
  gutscheincode: string;
  ean: string;
  kommentar: string;
  erstellt_am: string;
  erstellt_datum: string;
  erstellt_uhrzeit: string;
}

export default function AdminBestellungen() {
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/bestellungen')
      .then(res => {
        if (!res.ok) throw new Error('Serverfehler');
        return res.json();
      })
      .then(data => setBestellungen(data))
      .catch(() => setMessage('Fehler beim Laden der Bestellungen.'));
  }, []);

  return (
    <div className="admin-bestellungen">
      <h2>📋 Bestellungen anzeigen</h2>

      {message && <div className="admin-message">{message}</div>}

      {bestellungen.length > 0 ? (
        <table className="bestellungen-table">
          <thead>
            <tr>
              <th>Bestell-ID</th>
              <th>Gutscheincode</th>
              <th>EAN</th>
              <th>Kommentar</th>
              <th>Datum</th>
            </tr>
          </thead>
          <tbody>
            {bestellungen.map(b => (
              <tr key={b.bestell_id}>
                <td>{b.bestell_id}</td>
                <td>{b.gutscheincode}</td>
                <td>{b.ean}</td>
                <td>{b.kommentar}</td>
                <td>{b.erstellt_am}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !message && <p>Keine Bestellungen vorhanden.</p>
      )}
    </div>
  );
}
