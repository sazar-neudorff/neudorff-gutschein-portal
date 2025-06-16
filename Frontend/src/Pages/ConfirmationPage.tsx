import { useEffect, useState } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/ConfirmationPage.css';
import '../StyleCss/Buttons.css';
import '../StyleCss/errorModal.css';
import { useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const navigate = useNavigate();

  const [lieferkw, setLieferkw] = useState<string>('');
  const [bestellnummer, setBestellnummer] = useState<string>('');
  const [zeigeInhalt, setZeigeInhalt] = useState<boolean>(false);
  const [fehler, setFehler] = useState<{ nachricht: string; ziel: string } | null>(null);

  useEffect(() => {
    const gutscheincode = localStorage.getItem('gutscheincode');
    const produkt = localStorage.getItem('produkt');
    const adresse = localStorage.getItem('adresse');
    const lieferkw = localStorage.getItem('lieferkw');

    // ❌ Fehlerbehandlung: Redirect nur nach Klick auf OK
    if (!gutscheincode) {
      setFehler({ nachricht: 'Kein Gutscheincode gefunden. Du wirst zur Startseite weitergeleitet.', ziel: '/' });
      return;
    }
    if (!produkt) {
      setFehler({ nachricht: 'Kein Produkt ausgewählt. Du wirst zur Produktauswahl weitergeleitet.', ziel: '/auswahl' });
      return;
    }
    if (!adresse) {
      setFehler({ nachricht: 'Keine Adresse eingegeben. Du wirst zur Adresseingabe weitergeleitet.', ziel: '/adresse' });
      return;
    }
    if (!lieferkw) {
      setFehler({ nachricht: 'Kein Lieferzeitraum angegeben. Du wirst zur Lieferungsauswahl weitergeleitet.', ziel: '/lieferung' });
      return;
    }

    // ✅ Alles ist da → Seite freigeben
    setLieferkw(lieferkw);

    const letzteNummer = localStorage.getItem('letzteBestellnummer');
    const neueNummer = letzteNummer ? parseInt(letzteNummer) + 1 : 1;
    const bestellnummerFormatiert = `NP${neueNummer.toString().padStart(5, '0')}`;
    setBestellnummer(bestellnummerFormatiert);
    localStorage.setItem('letzteBestellnummer', neueNummer.toString());

    setZeigeInhalt(true); // jetzt darf Inhalt angezeigt werden

    // nach kurzer Zeit alles löschen (außer Bestellnummern-Zähler)
    const cleanup = setTimeout(() => {
      const letzte = localStorage.getItem('letzteBestellnummer');
      localStorage.clear();
      if (letzte) {
        localStorage.setItem('letzteBestellnummer', letzte);
      }
    }, 1000);

    return () => clearTimeout(cleanup);
  }, [navigate]);

  const handleModalClose = () => {
    if (fehler) {
      navigate(fehler.ziel, { replace: true });
    }
  };

  if (fehler) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>Fehlende Angaben</h3>
          <p>{fehler.nachricht}</p>
          <button className="btn btn-green" onClick={handleModalClose}>OK</button>
        </div>
      </div>
    );
  }

  if (!zeigeInhalt) {
    return null; // Zeige NICHTS, bis Daten validiert wurden
  }

  return (
    <Layout>
      <ProgressBar currentStep={5} />
      <div className="confirmation-page">
        <h2>Vielen Dank!</h2>
        <p>Deine Bestellung ist eingegangen.</p>

        <div className="info-box">
          <p><strong>Bestellnummer:</strong> {bestellnummer}</p>
          {lieferkw && (
            <p><strong>Die Lieferung erfolgt in:</strong> {lieferkw}</p>
          )}
        </div>

        <a className="home-link" href="/">Zurück zur Startseite</a>
      </div>
    </Layout>
  );
}