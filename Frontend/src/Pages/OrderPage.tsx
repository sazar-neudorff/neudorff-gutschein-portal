import { useEffect, useState } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/OrderPage.css';
import '../StyleCss/Buttons.css';
import { useNavigate } from 'react-router-dom';

interface Produkt {
  id: string;
  name: string;
  beschreibung: string;
  bild: string;
  einsatzorte: string[];
}

interface Kalenderwoche {
  kw: string;
  zeitraum: string;
}
  

export default function OrderPage() {
  const navigate = useNavigate();
  const [produkte, setProdukte] = useState<Produkt[]>([]);
  const [produktId, setProduktId] = useState('');
  const [einsatzort, setEinsatzort] = useState('');
  const [lieferkw, setLieferkw] = useState('');
  const [kalenderwochen, setKalenderwochen] = useState<Kalenderwoche[]>([]);
  const [error, setError] = useState('');
  const [codeTyp, setCodeTyp] = useState<'alt' | 'neu'>('neu');

  const produkt = produkte.find(p => p.id === produktId);

  useEffect(() => {
    const code = localStorage.getItem('gutscheincode');
    const typ = localStorage.getItem('code_typ') as 'alt' | 'neu';
    if (typ) setCodeTyp(typ);

    fetch(`http://localhost:5000/api/code-check?gutscheincode=${code}`)
      .then(res => res.json())
      .then(data => {
        if (typ === 'neu') {
          const p: Produkt = {
            id: data.produkt_id,
            name: data.produktname,
            beschreibung: data.beschreibung,
            bild: `/assets/${data.bildpfad}`,
            einsatzorte: data.einsatzorte
          };
          setProdukte([p]);
          setProduktId(p.id);
        }

        if (typ === 'alt' && data.produkte) {
          const list = data.produkte.map((p: any) => ({
            id: p.produkt_id,
            name: p.produktname,
            beschreibung: p.beschreibung,
            bild: `/assets/${p.bildpfad}`,
            einsatzorte: p.einsatzorte
          }));
          setProdukte(list);
        }
      });

    setKalenderwochen(generateKWsFromToday());
  }, []);

  useEffect(() => {
    // Wenn Produkt neu gewählt wird (bei alt), Einsatzort zurücksetzen
    if (codeTyp === 'alt') {
      setEinsatzort('');
    }
  }, [produktId, codeTyp]);

  const handleWeiter = () => {
    if (!produkt || !einsatzort || !lieferkw) {
      setError('Bitte wählen Sie Produkt, Einsatzort und Lieferzeit.');
      return;
    }

    localStorage.setItem('produkt', JSON.stringify(produkt));
    localStorage.setItem('einsatzort', einsatzort); // nur String!
    localStorage.setItem('lieferkw', lieferkw);
    navigate('/adresse');
  };

  return (
    <Layout>
      <ProgressBar currentStep={2} />
      <div className="orderpage-container">
        {/* Hinweisbox */}
        <div className="hinweis-box">
          <h4>🔍 HINWEIS:</h4>
          
          <p><strong>Pro Gutschein kann ein Nützling bestellt werden.</strong></p>
          <p>Die Nützlinge werden per DHL versendet. Die Lieferzeit beträgt 2–5 Werktage.</p>
          <p><strong>Kein Versand:</strong><br />
            – an Freitagen und Feiertagen<br />
            – bei Temperaturen unter 5 °C oder über 35 °C
          </p>
        </div>

        {/* Auswahlformular */}
        <div className="form-box">
          <h3>Nützlingsauswahl & Lieferzeit</h3>

          {/* Produktauswahl (nur alt) */}
          {codeTyp === 'alt' && (
            <div className="form-group">
              <label>Welchen Nützling wollen Sie einsetzen?</label>
              <select value={produktId} onChange={e => setProduktId(e.target.value)}>
                <option value="">— Bitte wählen —</option>
                {produkte.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Produktanzeige */}
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

          {/* Einsatzort-Auswahl für beide Typen */}
          {produkt?.einsatzorte?.length > 0 && (
            <div className="form-group">
              <label>Wo wollen Sie die Nützlinge einsetzen?</label>
              <select
                value={einsatzort}
                onChange={(e) => setEinsatzort(e.target.value)}
              >
                <option value="">— Bitte wählen —</option>
                {produkt.einsatzorte.map((ort, index) => (
                  <option key={index} value={ort}>
                    {ort}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lieferzeit-Auswahl */}
          {einsatzort && (
            <div className="form-group">
              <label>Lieferzeitraum (KW)</label>
              <select value={lieferkw} onChange={e => setLieferkw(e.target.value)}>
                <option value="">— Bitte wählen —</option>
                {kalenderwochen.map((k, i) => (
                  <option key={i} value={k.kw}>
                    {k.kw} – Lieferung: {k.zeitraum}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="order-nav">
            <button className="btn btn-brown btn-left" onClick={() => navigate('/')}>Zurück</button>
            <button className="btn btn-green btn-right" onClick={handleWeiter}>Weiter</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function generateKWsFromToday(): Kalenderwoche[] {
  const list: Kalenderwoche[] = [];
  const today = new Date();
  const end = new Date(today);
  end.setFullYear(end.getFullYear() + 1);

  const current = new Date(today);
  const day = current.getDay();
  const diff = (day + 6) % 7;
  current.setDate(current.getDate() - diff);

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
