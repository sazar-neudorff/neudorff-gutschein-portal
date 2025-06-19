import { useEffect, useState } from 'react';
import '../StyleCss/AdminBestand.css';
import { FaSave, FaTrashAlt } from 'react-icons/fa';

interface Code {
  gutscheincode: string;
  typ: string;
  status: string;
  ean: string;
}

export default function AdminBestand() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/api/codes')
      .then(res => res.json())
      .then(data => setCodes(data));
  }, []);

  const handleCheckbox = (code: string) => {
    setSelected(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;
    const res = await fetch('http://localhost:5000/admin/api/codes/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: selected }),
    });
    const data = await res.json();
    setMessage(data.message);
    setSelected([]);
    const updated = await fetch('http://localhost:5000/admin/api/codes');
    setCodes(await updated.json());
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);

    const res = await fetch('http://localhost:5000/admin/api/import', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setMessage(data.message || '');
    const updated = await fetch('http://localhost:5000/admin/api/codes');
    setCodes(await updated.json());
    setCsvFile(null);
  };

  return (
    <div className="admin-bestand">
      <h2>Gutscheincodes verwalten</h2>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-actions">
        <input
          type="file"
          accept=".csv"
          onChange={e => setCsvFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleCsvUpload}><FaSave /> CSV hochladen</button>
        <button id='del' onClick={deleteSelected} disabled={selected.length === 0}>
          <FaTrashAlt /> Ausgewählte löschen
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Code</th>
            <th>Typ</th>
            <th>Status</th>
            <th>EAN</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(c => (
            <tr key={c.gutscheincode}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(c.gutscheincode)}
                  onChange={() => handleCheckbox(c.gutscheincode)}
                />
              </td>
              <td>{c.gutscheincode}</td>
              <td>{c.typ}</td>
              <td>{c.status}</td>
              <td>{c.ean}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
