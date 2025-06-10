// src/Pages/StartPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../StyleCss/StartPage.css';
import '../StyleCss/Buttons.css';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';

export default function StartPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const gespeicherterCode = localStorage.getItem('gutscheincode');
    if (gespeicherterCode) {
      setCode(gespeicherterCode);
    }

    // localStorage leeren beim Verlassen
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
    if (data.produkt_id) {
      const produkt = {
        id: data.produkt_id,
        name: data.produktname,
        beschreibung: data.beschreibung,
        bild: data.bildpfad,
        einsatzorte: JSON.parse(data.einsatzorte || '[]')
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
    localStorage.removeItem('gutscheincode');
    localStorage.removeItem('code_typ');
    setCode('');
    setError('');
  };

  return (
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
  );
}
