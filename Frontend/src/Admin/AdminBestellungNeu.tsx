import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../StyleCss/AdminBestellungNeu.css';
import { FaSave } from 'react-icons/fa';

interface Produkt {
  id: string;
  name: string;
  beschreibung: string;
  einsatzorte: string[];
  bildpfad?: string;
}

interface Adresse {
  anrede: string;
  vorname: string;
  nachname: string;
  firma?: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  email: string;
  telefon?: string;
}

const kommentarOptionen = [
  'Telefonische Bestellung',
  'Gutschein unlesbar',
  'Support-Fall',
  'Systemfehler',
  'Sonstiger Grund'
];

const AdminBestellungNeu: React.FC = () => {
  const navigate = useNavigate();

  const [gutscheincode, setGutscheincode] = useState('');
  const [codeTyp, setCodeTyp] = useState<'alt' | 'neu' | ''>('');
  const [produkte, setProdukte] = useState<Produkt[]>([]);
  const [produktId, setProduktId] = useState('');
  const [kommentar, setKommentar] = useState('');
  const [customKommentar, setCustomKommentar] = useState('');
  const [adresse, setAdresse] = useState<Adresse>({
    anrede: '',
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    ort: '',
    email: ''
  });
  const [fehler, setFehler] = useState('');
  const [status, setStatus] = useState('');

  const selectedProdukt = produkte.find(p => p.id === produktId);

  const formatGutscheincode = (value: string) => {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join('-')
      .substring(0, 19) || '';
  };

  useEffect(() => {
    const raw = gutscheincode.replace(/-/g, '');
    if (raw.length === 16) {
      fetch(`http://localhost:5000/api/code-check?gutscheincode=${gutscheincode}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setFehler(data.error);
            setProdukte([]);
            setCodeTyp('');
            setProduktId('');
            return;
          }

          setFehler(''); // ✅ Fehler zurücksetzen bei erfolgreicher Antwort
          setCodeTyp(data.typ);

          if (data.typ === 'alt') {
            const altProdukte = (data.produkte || []).map((p: any) => ({
              id: p.id,
              name: p.produktname,
              beschreibung: p.beschreibung || '',
              einsatzorte: p.einsatzorte || [],
              bildpfad: p.bildpfad || ''
            }));
            setProdukte(altProdukte);
            setProduktId('');
          }

          if (data.typ === 'neu') {
            const produkt: Produkt = {
              id: data.ean,
              name: data.produktname,
              beschreibung: data.beschreibung || '',
              einsatzorte: data.einsatzorte || [],
              bildpfad: data.bildpfad || ''
            };
            setProdukte([produkt]);
            setProduktId(produkt.id);
          }
        })
        .catch(() => setFehler('Fehler bei Code-Prüfung.'));
    }
  }, [gutscheincode]);

  const handleAdresseChange = (feld: keyof Adresse, value: string) => {
    setAdresse(prev => ({ ...prev, [feld]: value }));
  };

  const handleSubmit = async () => {
    setFehler('');
    const finalKommentar = kommentar === 'Sonstiger Grund' ? customKommentar.trim() : kommentar;

    // ✅ ALLE Pflichtfelder prüfen
    if (
      !gutscheincode ||                     // ← Entferne diesen, wenn Gutscheincode optional sein soll
      !produktId ||
      !adresse.anrede ||                    // ← Entferne diesen, wenn Anrede optional sein soll
      !adresse.vorname ||
      !adresse.nachname ||
      !adresse.strasse ||
      !adresse.hausnummer ||
      !adresse.plz ||
      !adresse.ort ||
      !adresse.email ||
      !finalKommentar
    ) {
      setFehler('Bitte alle Pflichtfelder ausfüllen.');
      return;
    }

    const bestellung = {
      gutscheincode,
      produktId,
      kommentar: finalKommentar,
      adresse
    };

    try {
      const res = await fetch('http://localhost:5000/admin/api/bestellung/anlegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bestellung)
      });

      const result = await res.json();
      if (res.ok) {
        setStatus('✅ Bestellung erfolgreich gespeichert!');
        setTimeout(() => navigate('/admin/bestellungen'), 2000);
      } else {
        setFehler(result.error || 'Speichern fehlgeschlagen.');
      }
    } catch (err) {
      console.error(err);
      setFehler('Serverfehler beim Speichern.');
    }
  };

  return (
    <div className="admin-bestellung">
      <h2>📝 Manuelle Bestellung erfassen</h2>

      <div className="form-section">
        <label>Gutscheincode*</label>
        <input
          value={gutscheincode}
          onChange={e => setGutscheincode(formatGutscheincode(e.target.value))}
          placeholder="XXXX-XXXX-XXXX-XXXX"
        />
        {fehler && <p className="error-box">{fehler}</p>}

        <label>Produkt*</label>
        <select value={produktId} onChange={e => setProduktId(e.target.value)} disabled={codeTyp === 'neu'}>
          <option value="">— Bitte wählen —</option>
          {produkte.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProdukt && (
        <div className="produkt-info-wrapper">
          {selectedProdukt.bildpfad && (
            <div className="produkt-image">
              <img src={`/assets/${selectedProdukt.bildpfad}`} alt={selectedProdukt.name} />
            </div>
          )}
          <div className="produkt-text">
            <strong>{selectedProdukt.name}</strong>
            <p>{selectedProdukt.beschreibung}</p>
          </div>
        </div>
      )}

      <div className="form-section">
          <h4>Lieferadresse</h4>

          <div className="form-row">
            <input placeholder="Anrede*" value={adresse.anrede} onChange={e => handleAdresseChange('anrede', e.target.value)} />
            <input placeholder="Vorname*" value={adresse.vorname} onChange={e => handleAdresseChange('vorname', e.target.value)} />
          </div>

          <div className="form-row">
            <input placeholder="Nachname*" value={adresse.nachname} onChange={e => handleAdresseChange('nachname', e.target.value)} />
            <input placeholder="Firma (optional)" value={adresse.firma} onChange={e => handleAdresseChange('firma', e.target.value)} />
          </div>

          <div className="form-row">
            <input placeholder="Straße*" value={adresse.strasse} onChange={e => handleAdresseChange('strasse', e.target.value)} />
            <input placeholder="Hausnummer*" value={adresse.hausnummer} onChange={e => handleAdresseChange('hausnummer', e.target.value)} />
          </div>

          <div className="form-row">
            <input placeholder="PLZ*" value={adresse.plz} onChange={e => handleAdresseChange('plz', e.target.value)} />
            <input placeholder="Ort*" value={adresse.ort} onChange={e => handleAdresseChange('ort', e.target.value)} />
          </div>

          <div className="form-row">
            <input placeholder="E-Mail*" value={adresse.email} onChange={e => handleAdresseChange('email', e.target.value)} />
            <input placeholder="Telefon (optional)" value={adresse.telefon} onChange={e => handleAdresseChange('telefon', e.target.value)} />
          </div>
        </div>


      <div className="form-section">
        <label>Grund der manuellen Bestellung*</label>
        <select value={kommentar} onChange={e => setKommentar(e.target.value)}>
          <option value="">— Bitte wählen —</option>
          {kommentarOptionen.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {kommentar === 'Sonstiger Grund' && (
          <input
            placeholder="Bitte Grund angeben"
            value={customKommentar}
            onChange={e => setCustomKommentar(e.target.value)}
          />
        )}
      </div>

      
      {status && <p className="success-box">{status}</p>}

      <button className="save-button" onClick={handleSubmit}>
        <FaSave /> Bestellung speichern
      </button>
    </div>
  );
};

export default AdminBestellungNeu;
