import { useEffect, useState } from 'react';
import '../StyleCss/AdminStatistik.css';

interface StatistikData {
  produkte: number;
  bestellungen: number;
  gutscheine: {
    gesamt: number;
    verfügbar: number;
    verkauft: number;
    typ_alt: number;
    typ_neu: number;
  };
}

export default function AdminStatistik() {
  const [data, setData] = useState<StatistikData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/statistik')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => setError('Fehler beim Laden der Statistik.'));
  }, []);

  return (
    <div className="admin-statistik">
      <h2>Statistik & Auswertung</h2>

      {error && <div className="admin-message">{error}</div>}

      {data && (
        <>
          <div className="statistik-boxes">
            <div className="card">
              <h4>Produkte</h4>
              <p>{data.produkte}</p>
            </div>
            <div className="card">
              <h4>Gutscheincodes</h4>
              <p>{data.gutscheine.gesamt}</p>
            </div>
            <div className="card">
              <h4>Verfügbar</h4>
              <p>{data.gutscheine.verfügbar}</p>
            </div>
            <div className="card">
              <h4>Eingelöst</h4>
              <p>{data.gutscheine.verkauft}</p>
            </div>
            <div className="card">
              <h4>ALT-Codes</h4>
              <p>{data.gutscheine.typ_alt}</p>
            </div>
            <div className="card">
              <h4>NEU-Codes</h4>
              <p>{data.gutscheine.typ_neu}</p>
            </div>
            <div className="card">
              <h4>Bestellungen</h4>
              <p>{data.bestellungen}</p>
            </div>
          </div>

          {/* Optional später: Diagramme */}
        </>
      )}
    </div>
  );
}
