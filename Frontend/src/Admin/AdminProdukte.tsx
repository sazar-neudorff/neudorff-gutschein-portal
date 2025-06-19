import { useEffect, useState } from 'react';
import '../StyleCss/AdminProdukte.css';
import {
  FaTrashAlt
} from 'react-icons/fa';


interface Produkt {
  ean: string;
  produktname: string;
  beschreibung: string;
  bildpfad: string;
  einsatzorte: string;
}

export default function AdminProdukte() {
  const [produkte, setProdukte] = useState<Produkt[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/produkte')
      .then(res => res.json())
      .then(data => setProdukte(data))
      .catch(() => setMessage('Fehler beim Laden der Produkte.'));
  }, []);

  const handleDelete = async (ean: string) => {
    const confirm = window.confirm('Produkt wirklich löschen?');
    if (!confirm) return;

    const res = await fetch('http://localhost:5000/admin/api/produkte/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ean }),
    });

    const data = await res.json();
    setMessage(data.message || '');
    setProdukte(produkte.filter(p => p.ean !== ean));
  };

  return (
    <div className="admin-produkte">
      <h2>Produktkatalog verwalten</h2>
      {message && <div className="admin-message">{message}</div>}

      <table className="produkte-table">
        <thead>
          <tr>
            <th>EAN</th>
            <th>Name</th>
            <th>Beschreibung</th>
            <th>Bild</th>
            <th>Einsatzorte</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {produkte.map(p => (
            <tr key={p.ean}>
              <td>{p.ean}</td>
              <td>{p.produktname}</td>
              <td>{p.beschreibung}</td>
              <td>
                <img src={`/assets/${p.bildpfad}`} alt={p.produktname} height="40" />
              </td>
              <td>{p.einsatzorte}</td>
              <td>
                <button className="btn-delete" onClick={() => handleDelete(p.ean)}>
                   <FaTrashAlt />Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}