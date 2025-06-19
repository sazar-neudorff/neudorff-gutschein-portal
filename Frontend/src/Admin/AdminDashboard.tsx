import { useEffect, useState } from 'react';
import {
  FaTools,
} from 'react-icons/fa';

import '../StyleCss/AdminDashboard.css';

// 👉 Eigene Seitenkomponenten importieren
import AdminBestand from './AdminBestand';
import AdminProdukte from './AdminProdukte';
import AdminBestellungen from './AdminBestellungen';
import AdminStatistiken from './AdminStatistiken';
import AdminAdressen from './AdminAdressen';
import AdminBestellungNeu from './AdminBestellungNeu';
/* import CSVImport from './CSVImport'; */

interface Statistik {
  produkte: number;
  gutscheine: {
    gesamt: number;
    verfügbar: number;
    verkauft: number;
    typ_alt: number;
    typ_neu: number;
  };
  bestellungen: number;
}

export default function AdminDashboard() {
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('übersicht');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/statistik')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setStatistik(data);
        }
      })
      .catch(() => setError('Fehler beim Laden der Statistikdaten.'));
  }, []);

  return (
    <div className="admin-wrapper">
      <div className="admin-container">

        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <h2><FaTools style={{ marginRight: '6px' }} /> Admin</h2>
          <div className={`sidebar-item ${activePage === 'übersicht' ? 'active' : ''}`} onClick={() => setActivePage('übersicht')}>Übersicht</div>
          <div className={`sidebar-item ${activePage === 'gutscheine' ? 'active' : ''}`} onClick={() => setActivePage('gutscheine')}>Gutscheincodes verwalten</div>
          <div className={`sidebar-item ${activePage === 'produkte' ? 'active' : ''}`} onClick={() => setActivePage('produkte')}>Produkte verwalten</div>
          <div className={`sidebar-item ${activePage === 'bestellungen' ? 'active' : ''}`} onClick={() => setActivePage('bestellungen')}>Bestellungen anzeigen</div>
          <div className={`sidebar-item ${activePage === 'statistik' ? 'active' : ''}`} onClick={() => setActivePage('statistik')}>Diagramme & Statistik</div>
          <div className={`sidebar-item ${activePage === 'adressen' ? 'active' : ''}`} onClick={() => setActivePage('adressen')}>Adressen bearbeiten</div>
          <div className={`sidebar-item ${activePage === 'bestellung' ? 'active' : ''}`} onClick={() => setActivePage('bestellung')}>Bestellung aufgeben</div>
          <div className={`sidebar-item ${activePage === 'csv' ? 'active' : ''}`} onClick={() => setActivePage('csv')}>CSV hochladen</div>
        </div>

        {/* Rechter Content-Bereich */}
        <div className="admin-content">
          {activePage === 'übersicht' && (
            <>
              <h1><FaTools /> Adminbereich</h1>
              <p className="subheadline">
                Übersicht und Verwaltung aller Daten rund um Gutscheine, Produkte und Bestellungen.
              </p>

              {error && <p className="error-box">{error}</p>}

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h4>Produkte</h4>
                  <p>{statistik?.produkte ?? '–'}</p>
                </div>
                <div className="dashboard-card">
                  <h4>Gutscheincodes</h4>
                  <p>{statistik?.gutscheine?.gesamt ?? '–'}</p>
                </div>
                <div className="dashboard-card">
                  <h4>Eingelöste Codes</h4>
                  <p>{statistik?.gutscheine?.verkauft ?? '–'}</p>
                </div>
                <div className="dashboard-card">
                  <h4>Bestellungen</h4>
                  <p>{statistik?.bestellungen ?? '–'}</p>
                </div>
              </div>
            </>
          )}

          {activePage === 'gutscheine' && <AdminBestand />}
          {activePage === 'produkte' && <AdminProdukte />}
          {activePage === 'bestellungen' && <AdminBestellungen />}
          {activePage === 'statistik' && <AdminStatistiken />}
          {activePage === 'adressen' && <AdminAdressen />}
          {activePage === 'bestellung' && <AdminBestellungNeu />}
        </div>
      </div>
    </div>
  );
}
