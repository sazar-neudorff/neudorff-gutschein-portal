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
  const [text2, setText2] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Welcome-Tippen + Animation
  
  useEffect(() => {
  const line1 = 'Neudorff Nützlingsportal';
  const line2 = '';

  let index = 0;
    const timer1 = setInterval(() => {
      if (index < line1.length) {
        const nextChar = line1.charAt(index);
        setText1(prev => prev + nextChar);
        index++;
      } else {
        clearInterval(timer1);
      }
    }, 60);

    let interval2: ReturnType<typeof setInterval>;

    const timer2 = setTimeout(() => {
      let j = 0;
      interval2 = setInterval(() => {
        if (j < line2.length) {
          const nextChar = line2.charAt(j);
          setText2(prev => prev + nextChar);
          j++;
        } else {
          clearInterval(interval2);
        }
      }, 60);
    }, line1.length * 60 + 200);

    const exit = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setShowWelcome(false), 1000);
    }, 2500);

    return () => {
      clearInterval(timer1);
      clearTimeout(timer2);
      clearInterval(interval2);
      clearTimeout(exit);
    };
  }, []);

  // Gutscheinlogik
  useEffect(() => {
    const gespeicherterCode = localStorage.getItem('gutscheincode');
    if (gespeicherterCode) {
      setCode(gespeicherterCode);
    }

    const resetStorage = () => {
      localStorage.clear();
    };

    window.addEventListener('beforeunload', resetStorage);
    return () => window.removeEventListener('beforeunload', resetStorage);
  }, []);

  const formatCode = (value: string) => {
    const raw = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join('-') : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatCode(input);
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

      if (data.typ === 'alt' && Array.isArray(data.produkte) && data.produkte.length > 0) {
        const first = data.produkte[0];
        const produkt = {
          id: first.id,
          name: first.produktname,
          beschreibung: first.beschreibung,
          bild: first.bildpfad,
          einsatzorte: first.einsatzorte || []
        };
        localStorage.setItem('produkt', JSON.stringify(produkt));
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
          <h1>{text1 || ''}</h1>
          <h2>{text2 || ''}</h2>
        </div>
      )}
    </>
  );
}
