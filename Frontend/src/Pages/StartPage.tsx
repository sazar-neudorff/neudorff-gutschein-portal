import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../StyleCss/StartPage.css';
import '../StyleCss/WelcomeScreen.css';
import '../StyleCss/Buttons.css';
import ProgressBar from '../Elements/ProgressBar';
import Layout from './Layout';
import logoImg from '../assets/logo.png';

export default function StartPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [text1, setText1] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Begrüßungsanimation mit Timing-Schutz
  useEffect(() => {
    const line1 = 'Neudorff Nützlingsportal';
    const typingSpeed = 60;
    const showPauseAfterTyping = 1000;
    let index = 0;

    const typeNext = () => {
      if (index <= line1.length) {
        setText1(line1.slice(0, index));
        index++;
        setTimeout(typeNext, typingSpeed);
      } else {
        // Nach Animation → kurz anzeigen, dann ausblenden
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => setShowWelcome(false), 1000); // fadeOut dauert 1 Sekunde
        }, showPauseAfterTyping);
      }
    };

    typeNext();

    return () => {
      // keine Cleanup nötig, da alles in setTimeout läuft
    };
  }, []);

  // Vorbefüllen bei Rückkehr
  useEffect(() => {
    const gespeicherterCode = localStorage.getItem('gutscheincode');
    if (gespeicherterCode) {
      setCode(gespeicherterCode);
    }

    // Nur beim Verlassen alles löschen
    const clearOnExit = () => {
      localStorage.clear();
    };
    window.addEventListener('beforeunload', clearOnExit);
    return () => window.removeEventListener('beforeunload', clearOnExit);
  }, []);

  const formatCode = (value: string) => {
    const raw = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join('-') : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCode = code.replace(/-/g, '');

    if (rawCode.length !== 16) {
      setError('Der Gutscheincode muss genau 16 Zeichen lang sein.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/code-check?gutscheincode=${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Fehler bei der Prüfung des Codes.');
        return;
      }

      localStorage.setItem('gutscheincode', data.gutscheincode);
      localStorage.setItem('code_typ', data.typ);

      if (data.typ === 'neu' && data.ean) {
        const produkt = {
          id: data.ean,
          name: data.produktname,
          beschreibung: data.beschreibung,
          bild: data.bildpfad,
          einsatzorte: data.einsatzorte || []
        };
        localStorage.setItem('produkt', JSON.stringify(produkt));
      }

      if (data.typ === 'alt' && Array.isArray(data.produkte)) {
        localStorage.removeItem('produkt'); // Auswahl erfolgt später
      }

      navigate('/auswahl');
    } catch (err) {
      console.error(err);
      setError('Verbindungsfehler. Bitte später erneut versuchen.');
    }
  };

  const handleRemoveCode = () => {
    localStorage.clear();
    setCode('');
    setError('');
  };

  return (
    <>
      <Layout>
        <ProgressBar currentStep={1} />
        <div className="start-page">
          <h2>Willkommen beim<br />Nützlings Gutschein-Portal</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="code" className="code-label">
              <strong>Bitte Gutscheincode eingeben:</strong>
            </label>
            <input
              id="code"
              type="text"
              placeholder="____-____-____-____"
              value={code}
              onChange={handleChange}
              maxLength={19}
              className="code-input"
            />
            {error && <p className="error">{error}</p>}
            <button className="btn btn-green btn-right" type="submit">Code prüfen</button>
          </form>

          {code && (
            <p className="code-clear-text" onClick={handleRemoveCode}>
              Gutscheincode entfernen?
            </p>
          )}

          <p className="info-text">
            Du findest deinen Code auf dem Kassenbon oder deiner Bestellbestätigung.
          </p>
          <a href="https://www.neudorff.de/suche?s=n%C3%BCtzlinge">
            Sie besitzen keinen Bestell-Set-Code?
          </a>
        </div>
      </Layout>

      {showWelcome && (
        <div className={`welcome-screen ${fadeOut ? 'hide' : ''}`}>
          <img src={logoImg} alt="Neudorff Logo" className="welcome-logo" />
          <h1>{text1}</h1>
        </div>
      )}
    </>
  );
}
