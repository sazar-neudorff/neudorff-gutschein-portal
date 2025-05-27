// src/Pages/OrderPage.tsx
import { useEffect, useState } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/OrderPage.css';
import '../StyleCss/Buttons.css';
import { useNavigate } from 'react-router-dom';

// Produkt-Typ
interface Produkt {
  id: string;
  name: string;
  beschreibung: string;
  bild: string;
  einsatzorte: string[];
}

// Kalenderwochen-Typ
interface Kalenderwoche {
  kw: string;
  zeitraum: string;
}

// Beispiel-Produkte
const PRODUKTE: Produkt[] = [
  {
    id: 'hm1',
    name: 'HM-Nematoden gegen Dickmaulrüssler',
    beschreibung: 'Menge: 10 Mio. Dauerlarven für 20 m²',
    bild: '/assets/placeholder.jpg',
    einsatzorte: ['Innenräume', 'Freiland']
  },
  {
    id: 'sf1',
    name: 'SF-Nematoden gegen Trauermücken',
    beschreibung: 'Menge: 10 Mio. Für Zimmerpflanzen',
    bild: '/assets/placeholder.jpg',
    einsatzorte: ['Innenräume']
  },
  {
    id: 'sc1',
    name: 'SC-Nematoden gegen Wiesenschnake',
    beschreibung: 'Menge: 10 Mio. Für Gartenböden',
    bild: '/assets/placeholder.jpg',
    einsatzorte: ['Freiland']
  }
];

export default function OrderPage() {
  const navigate = useNavigate();
  const [produktId, setProduktId] = useState('');
  const [einsatzort, setEinsatzort] = useState('');
  const [lieferkw, setLieferkw] = useState('');
  const [error, setError] = useState('');

  const [kalenderwochen, setKalenderwochen] = useState<Kalenderwoche[]>([]);

  const produkt = PRODUKTE.find(p => p.id === produktId);

  // 🟢 Daten beim Start aus localStorage laden
  useEffect(() => {
    setKalenderwochen(generateKWsFromToday());

    const savedProdukt = localStorage.getItem('produkt');
    const savedLieferkw = localStorage.getItem('lieferkw');

    if (savedProdukt) {
      try {
        const parsed = JSON.parse(savedProdukt);
        setProduktId(parsed.id || '');
        setEinsatzort(parsed.einsatzorte?.[0] || ''); // optional Vorbelegung
      } catch {}
    }

    if (savedLieferkw) {
      setLieferkw(savedLieferkw);
    }
  }, []);

  // 🟢 Änderungen live speichern
  useEffect(() => {
    const p = PRODUKTE.find(p => p.id === produktId);
    if (p) {
      localStorage.setItem('produkt', JSON.stringify(p));
    }
  }, [produktId]);

  useEffect(() => {
    if (lieferkw) {
      localStorage.setItem('lieferkw', lieferkw);
    }
  }, [lieferkw]);

  const handleWeiter = () => {
    if (!produkt || !einsatzort || !lieferkw) {
      setError('Bitte wähle alle Felder aus.');
      return;
    }

    localStorage.setItem('produkt', JSON.stringify(produkt));
    localStorage.setItem('lieferkw', lieferkw);
    navigate('/adresse');
  };

  return (
    <Layout>
      <ProgressBar currentStep={2} />
      <div className="orderpage-container">
        {/* Hinweis (links) */}
        <div className="hinweis-box">
          <h4>🔍 HINWEIS:</h4>
          <p><strong>Bitte wählen Sie pro Bestell-Set eine Nützlingsart aus.</strong> Wir fragen den Anwendungsort ab, um den passenden Versandzeitraum zu bestimmen.</p>
          <p>Die Nützlinge werden per DHL versendet. Die Lieferzeit beträgt 2–5 Werktage.</p>
          <p><strong>Kein Versand:</strong><br />
            – an Freitagen und Feiertagen<br />
            – bei Temperaturen unter 5 °C oder über 35 °C
          </p>
          <div className="hinweis-links">
            <a href="/" className="link-inline">Bestell-Set-Code ändern</a><br />
          </div>
        </div>

        {/* Auswahlbereich (rechts) */}
        <div className="form-box">
          <h3>Nützlingsauswahl & Lieferzeit</h3>

          {/* Produktauswahl */}
          <div className="form-group">
            <label>Welchen Nützling wollen Sie einsetzen?</label>
            <select value={produktId} onChange={e => setProduktId(e.target.value)}>
              <option value="">— Bitte wählen —</option>
              {PRODUKTE.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Vorschau */}
          {produkt && (
            <div className="produkt-info-wrapper">
              <div className="produkt-image">
                <img src={produkt.bild} alt={produkt.name} />
              </div>
              <div className="produkt-text">
                <strong>{produkt.name}</strong>
                <p>{produkt.beschreibung}</p>
              </div>
            </div>
          )}

          {/* Einsatzort */}
          {produkt && (
            <div className="form-group">
              <label>Wo wollen Sie die Nützlinge einsetzen?</label>
              <select value={einsatzort} onChange={e => setEinsatzort(e.target.value)}>
                <option value="">— Bitte wählen —</option>
                {produkt.einsatzorte.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Lieferzeit */}
          {einsatzort && (
            <div className="form-group">
              <label>Wann sollen wir die Nützlinge versenden? (KW = Kalenderwoche)</label>
              <select value={lieferkw} onChange={e => setLieferkw(e.target.value)}>
                <option value="">— Bitte wählen —</option>
                {kalenderwochen.map((k, index) => (
                    <option key={`${k.kw}-${index}`} value={k.kw}>
                      {k.kw} – Lieferung erfolgt zwischen dem {k.zeitraum}
                    </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="order-nav">
            <button className="btn btn-brown btn-left"   onClick={() => navigate('/')}>Zurück</button>
            <button className="btn btn-green btn-right" onClick={handleWeiter}>Weiter</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Hilfsfunktionen für KW
function generateKWsFromToday(): Kalenderwoche[] {
  const list: Kalenderwoche[] = [];
  const today = new Date();
  const end = new Date(today);
  end.setFullYear(end.getFullYear() + 1);

  const current = new Date(today);
  const day = current.getDay();
  const diff = (day + 6) % 7;
  current.setDate(current.getDate() - diff); // auf Montag setzen

  while (current < end) {
    const monday = new Date(current);
    const friday = new Date(current);
    friday.setDate(monday.getDate() + 4);

    list.push({
      kw: `KW ${getISOWeek(monday)}`,
      zeitraum: `${formatDate(monday)} – ${formatDate(friday)}`
    });

    current.setDate(current.getDate() + 7);
  }

  return list;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
