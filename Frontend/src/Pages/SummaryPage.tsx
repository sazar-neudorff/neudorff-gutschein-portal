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
  const [rechnungAdresse, setRechnungAdresse] = useState<any>(null);
  const [lieferkw, setLieferkw] = useState('');

  useEffect(() => {
    const gespeicherterCode = localStorage.getItem('gutscheincode');
    const gespeichertesProdukt = localStorage.getItem('produkt');
    const gespeicherteAdresse = localStorage.getItem('adresse');
    const gespeicherteLieferkw = localStorage.getItem('lieferkw');
    const gespeicherteRechnung = localStorage.getItem('rechnungAdresse');

    // Wenn irgendwas fehlt → zurück zur Startseite
    if (!gespeicherterCode || !gespeichertesProdukt || !gespeicherteAdresse || !gespeicherteLieferkw) {
      navigate('/', { replace: true });
      return;
    }

    setGutschein(gespeicherterCode);
    setProdukt(JSON.parse(gespeichertesProdukt));
    const parsedAdresse = JSON.parse(gespeicherteAdresse);
    setAdresse(parsedAdresse);
    setLieferkw(gespeicherteLieferkw);

    if (gespeicherteRechnung) {
      setRechnungAdresse(JSON.parse(gespeicherteRechnung));
    } else {
      setRechnungAdresse(parsedAdresse); // fallback: gleiche wie Lieferadresse
    }
  }, [navigate]);

  const handleBestellen = () => {
    // Hier könnte man später einen API-Aufruf machen
    navigate('/bestaetigung');
  };

  if (!produkt || !adresse || !rechnungAdresse || !gutschein) {
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

          <div className="summary-block">
            <h3>Rechnungsadresse{rechnungAdresse === adresse ? ' (gleich Lieferadresse)' : ''}</h3>
            <p>
              {rechnungAdresse.anrede
                ? `${rechnungAdresse.anrede} ${rechnungAdresse.vorname} ${rechnungAdresse.nachname}`
                : `${adresse.anrede} ${adresse.vorname} ${adresse.nachname}`}
              <br />
              {rechnungAdresse.firma && <>{rechnungAdresse.firma}<br /></>}
              {rechnungAdresse.strasse} {rechnungAdresse.nr}<br />
              {rechnungAdresse.plz} {rechnungAdresse.ort}<br />
              {rechnungAdresse.email || adresse.email}<br />
              {rechnungAdresse.telefon && <>{rechnungAdresse.telefon}</>}
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

          <div className="summary-block">
            <h3>Gutscheincode</h3>
            <p>{gutschein}</p>
          </div>
        </div>

        <div className="summary-nav">
          <button className="btn btn-brown btn-left" type="button" onClick={() => navigate('/adresse')}>Zurück</button>
          <button className="btn btn-green btn-right" onClick={handleBestellen}>Verbindlich bestellen</button>
        </div>
      </div>
    </Layout>
  );
}
