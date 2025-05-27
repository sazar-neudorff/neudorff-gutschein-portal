// src/Pages/AddressPage.tsx
import { useState, useEffect } from 'react';
import Layout from './Layout';
import ProgressBar from '../Elements/ProgressBar';
import '../StyleCss/AddressPage.css';
import '../StyleCss/Buttons.css';
import { useNavigate } from 'react-router-dom';

export default function AddressPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    anrede: '',
    vorname: '',
    nachname: '',
    firma: '',
    strasse: '',
    nr: '',
    plz: '',
    ort: '',
    email: '',
    emailWdh: '',
    telefon: '',
    datenschutz: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 🟢 Vorbefüllen aus localStorage
  useEffect(() => {
    const gespeicherteAdresse = localStorage.getItem('adresse');
    if (gespeicherteAdresse) {
      try {
        setForm(JSON.parse(gespeicherteAdresse));
      } catch {}
    }
  }, []);

  // 🟢 Optional: Live-Speichern bei jeder Eingabe
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const newValue = type === 'checkbox' ? (target as HTMLInputElement).checked : value;

    const updatedForm = { ...form, [name]: newValue };
    setForm(updatedForm);
    localStorage.setItem('adresse', JSON.stringify(updatedForm));

    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.anrede) newErrors.anrede = 'Pflichtfeld';
    if (!form.vorname) newErrors.vorname = 'Pflichtfeld';
    if (!form.nachname) newErrors.nachname = 'Pflichtfeld';
    if (!form.strasse) newErrors.strasse = 'Pflichtfeld';
    if (!form.nr) newErrors.nr = 'Pflichtfeld';
    if (!form.plz) newErrors.plz = 'Pflichtfeld';
    if (!form.ort) newErrors.ort = 'Pflichtfeld';
    if (!form.email) newErrors.email = 'Pflichtfeld';
    if (form.email.trim() !== form.emailWdh.trim()) newErrors.emailWdh = 'E-Mails stimmen nicht überein';
    if (!form.datenschutz) newErrors.datenschutz = 'Zustimmung erforderlich';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Falls du NICHT live speicherst, kannst du hier nochmal speichern:
    localStorage.setItem('adresse', JSON.stringify(form));
    navigate('/zusammenfassung');
  };

  return (
    <Layout>
      <ProgressBar currentStep={3} />
      <div className="address-page">
        <h2>Lieferanschrift</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Anrede*</label>
            <select name="anrede" value={form.anrede} onChange={handleChange}>
              <option value="">-- wählen --</option>
              <option>Frau</option>
              <option>Herr</option>
              <option>Divers</option>
            </select>
            {errors.anrede && <p className="error">{errors.anrede}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vorname*</label>
              <input name="vorname" value={form.vorname} onChange={handleChange} />
              {errors.vorname && <p className="error">{errors.vorname}</p>}
            </div>
            <div className="form-group">
              <label>Nachname*</label>
              <input name="nachname" value={form.nachname} onChange={handleChange} />
              {errors.nachname && <p className="error">{errors.nachname}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Firma (optional)</label>
            <input name="firma" value={form.firma} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Straße*</label>
              <input name="strasse" value={form.strasse} onChange={handleChange} />
              {errors.strasse && <p className="error">{errors.strasse}</p>}
            </div>
            <div className="form-group">
              <label>Nr.*</label>
              <input name="nr" value={form.nr} onChange={handleChange} />
              {errors.nr && <p className="error">{errors.nr}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PLZ*</label>
              <input name="plz" value={form.plz} onChange={handleChange} />
              {errors.plz && <p className="error">{errors.plz}</p>}
            </div>
            <div className="form-group">
              <label>Ort*</label>
              <input name="ort" value={form.ort} onChange={handleChange} />
              {errors.ort && <p className="error">{errors.ort}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>E-Mail-Adresse*</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>E-Mail-Adresse wiederholen*</label>
            <input name="emailWdh" type="email" value={form.emailWdh} onChange={handleChange} />
            {errors.emailWdh && <p className="error">{errors.emailWdh}</p>}
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input name="telefon" value={form.telefon} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" name="datenschutz" checked={form.datenschutz} onChange={handleChange} />
              Ich akzeptiere die Datenschutzbedingungen.*
            </label>
            {errors.datenschutz && <p className="error">{errors.datenschutz}</p>}
          </div>

          <div className="form-nav">
            <button className="btn btn-brown btn-left" type="button" onClick={() => navigate('/auswahl')}>Zurück</button>
            <button className="btn btn-green btn-right" type="submit">Weiter</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
