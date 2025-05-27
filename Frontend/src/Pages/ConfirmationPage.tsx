import { useEffect, useState } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/ConfirmationPage.css';
import '../StyleCss/Buttons.css';

export default function ConfirmationPage() {
  const [lieferkw, setLieferkw] = useState<string>('');
  const bestellnummer = Math.floor(1000000 + Math.random() * 9000000);

  useEffect(() => {
    const gespeicherteLieferkw = localStorage.getItem('lieferkw');
    if (gespeicherteLieferkw) {
      setLieferkw(gespeicherteLieferkw);
    }

    // Nach dem Rendern automatisch alles löschen
    return () => {
      localStorage.clear();
    };
  }, []);

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
