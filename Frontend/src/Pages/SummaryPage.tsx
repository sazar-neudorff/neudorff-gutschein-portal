/* export default function SummaryPage() {
    return <h2>SummaryPage – Übersicht</h2>;
  } */

 // src/Pages/SummaryPage.tsx
import { useEffect, useState } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/SummaryPage.css';
import '../StyleCss/Buttons.css';
import { useNavigate } from 'react-router-dom';

export default function SummaryPage() {
  const navigate = useNavigate();
  const [gutschein, setGutschein] = useState('');
  const [produkt, setProdukt] = useState<any>(null);
  const [adresse, setAdresse] = useState<any>(null);
  const [lieferkw, setLieferkw] = useState('');

  useEffect(() => {
    const gespeicherterCode = localStorage.getItem('gutscheincode');
    const gespeichertesProdukt = localStorage.getItem('produkt');
    const gespeicherteAdresse = localStorage.getItem('adresse');
    const gespeicherteLieferkw = localStorage.getItem('lieferkw'); // NEU
  
    if (gespeicherterCode) setGutschein(gespeicherterCode);
    if (gespeichertesProdukt) setProdukt(JSON.parse(gespeichertesProdukt));
    if (gespeicherteAdresse) setAdresse(JSON.parse(gespeicherteAdresse));
    if (gespeicherteLieferkw) setLieferkw(gespeicherteLieferkw); // NEU
  }, []);

  const handleBestellen = () => {
    // Hier könnte man später API-Aufruf machen
    navigate('/bestaetigung');
  };

  // Wenn Daten fehlen, Ladeanzeige zeigen
  if (!produkt || !adresse || !gutschein) {
    return (
      <Layout>
        <ProgressBar currentStep={4} />
        <div className="summary-page">
          <h2>Lade Daten...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProgressBar currentStep={4} />
      <div className="summary-page">
          <h2>Zusammenfassung</h2>

          <div className="summary-grid">
            <div className="summary-block">
              <h3>Gutscheincode</h3>
              <p>{gutschein}</p>
            </div>

            <div className="summary-block produkt">
              <h3>Produkt</h3>
              <div className="produkt-wrapper">
                <div className="produkt-bild">
                  <img
                    src={produkt?.bild || '/assets/placeholder.jpg'}
                    alt={produkt?.name || 'Produkt'}
                  />
                </div>
                <div className="produkt-info">
                  <h4>{produkt?.name}</h4>
                  <p>{produkt?.beschreibung}</p>
                </div>
              </div>
            </div>

            <div className="summary-block">
              <h3>Lieferadresse</h3>
              <p>
                {adresse.anrede} {adresse.vorname} {adresse.nachname}<br />
                {adresse.firma && <>{adresse.firma}<br /></>}
                {adresse.strasse} {adresse.nr}<br />
                {adresse.plz} {adresse.ort}<br />
                {adresse.email}<br />
                {adresse.telefon && <>{adresse.telefon}</>}
              </p>
            </div>

            <div className="summary-block lieferung">
              <h3>Lieferzeitraum</h3>
              <p>{lieferkw}</p>
            </div>

            <div className="summary-block bearbeiten">
              <h3>Eingaben bearbeiten</h3>
              <div className="hinweis-links">
                <a href="/" className="link-inline">Bestell-Set-Code ändern</a><br />
                <a href="/adresse" className="link-inline">Lieferadresse ändern</a><br />
              </div>
            </div>
          </div>

          <div className="summary-nav">
            <button className="btn btn-brown btn-left"  type="button" onClick={() => navigate('/adresse')}>Zurück</button>
            <button className="btn btn-green btn-right" onClick={handleBestellen}>Verbindlich bestellen</button>
          </div>
        </div>
    </Layout>
  );
}
