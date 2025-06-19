from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import csv
import io
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ✅ Datenbankverbindung
db_config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '',
    'database': 'gutscheinportal'
}

# =============================
# 🔓 ÖFFENTLICH: CODE-PRÜFUNG
# =============================
@app.route('/api/code-check', methods=['GET'])
def check_code():
    gutscheincode = request.args.get('gutscheincode', '').replace('-', '').strip()
    if not gutscheincode:
        return jsonify({'error': 'Kein Code übergeben'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT b.gutscheincode, b.typ, b.status, b.ean,
               p.produktname, p.beschreibung, p.bildpfad, p.einsatzorte
        FROM bestand b
        LEFT JOIN produkte p ON b.ean = p.ean
        WHERE b.gutscheincode = %s
    """
    cursor.execute(query, (gutscheincode,))
    result = cursor.fetchone()

    if result and result["typ"] == "alt":
        cursor.execute("""
            SELECT p.ean, p.produktname, p.beschreibung, p.bildpfad, p.einsatzorte
            FROM altcode_produktzuordnung a
            JOIN produkte p ON a.ean = p.ean
            WHERE a.gutscheincode = %s
        """, (gutscheincode,))
        produkte = cursor.fetchall()

        for p in produkte:
            p["einsatzorte"] = [s.strip() for s in (p.get("einsatzorte") or "").split(",")]
            p["id"] = p.pop("ean")

        cursor.close()
        conn.close()

        return jsonify({
            "gutscheincode": result["gutscheincode"],
            "typ": result["typ"],
            "produkte": produkte
        })

    if result:
        einsatzorte = [s.strip() for s in (result.get("einsatzorte") or "").split(",")]
        cursor.close()
        conn.close()
        return jsonify({
            "gutscheincode": result["gutscheincode"],
            "typ": result["typ"],
            "status": result["status"],
            "ean": result["ean"],
            "produktname": result["produktname"],
            "beschreibung": result["beschreibung"],
            "bildpfad": result["bildpfad"],
            "einsatzorte": einsatzorte
        })

    cursor.close()
    conn.close()
    return jsonify({'error': 'Gutschein nicht gefunden'}), 404

# =============================
# 🔐 ADMIN: STATISTIK
# =============================
@app.route('/admin/api/statistik', methods=['GET'])
def admin_statistik():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS anzahl FROM produkte")
        produkte = cursor.fetchone()['anzahl']

        cursor.execute("""
            SELECT COUNT(*) AS total,
                   SUM(status='verfügbar') AS verfuegbar,
                   SUM(status='verkauft') AS verkauft,
                   SUM(typ='alt') AS alt,
                   SUM(typ='neu') AS neu
            FROM bestand
        """)
        code_data = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) AS anzahl FROM bestellungen")
        bestellungen = cursor.fetchone()['anzahl']

        cursor.close()
        conn.close()

        return jsonify({
            'produkte': produkte,
            'gutscheine': {
                'gesamt': code_data['total'],
                'verfügbar': code_data['verfuegbar'],
                'verkauft': code_data['verkauft'],
                'typ_alt': code_data['alt'],
                'typ_neu': code_data['neu']
            },
            'bestellungen': bestellungen
        })

    except Exception as e:
        print("Fehler in /statistik:", e)
        return jsonify({'error': 'Statistikfehler'}), 500

# =============================
# 🔐 ADMIN: ALLE CODES LADEN UND LÖSCHEN
# =============================
@app.route('/admin/api/codes', methods=['GET'])
def get_all_codes():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT gutscheincode, typ, status, ean FROM bestand ORDER BY gutscheincode ASC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)

@app.route('/admin/api/codes/delete', methods=['POST'])
def delete_codes():
    codes = request.json.get('codes', [])
    if not codes:
        return jsonify({'error': 'Keine Codes angegeben'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    try:
        format_str = ','.join(['%s'] * len(codes))
        cursor.execute(f"DELETE FROM bestand WHERE gutscheincode IN ({format_str})", tuple(codes))
        conn.commit()
        deleted = cursor.rowcount
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({'message': f'{deleted} Codes gelöscht'})

# =============================
# 🔐 ADMIN: CSV IMPORT
# =============================
@app.route('/admin/api/import', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'Keine Datei erhalten'}), 400

    file = request.files['file']
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
    except Exception:
        return jsonify({'error': 'Datei konnte nicht gelesen werden'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    inserted = 0

    for row in csv_input:
        if len(row) < 4:
            continue
        gutscheincode, ean, typ, status = [r.strip() for r in row[:4]]
        try:
            cursor.execute("""
                INSERT INTO bestand (gutscheincode, ean, typ, status)
                VALUES (%s, %s, %s, %s)
            """, (gutscheincode, ean, typ, status))
            inserted += 1
        except mysql.connector.Error:
            continue

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": f"{inserted} Codes importiert."})

# =============================
# 🔐 ADMIN: PRODUKTE LADEN
# =============================
@app.route('/admin/api/produkte', methods=['GET'])
def get_produkte():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM produkte")
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        print("Fehler beim Laden der Produkte:", e)
        return jsonify({'error': 'Fehler beim Laden der Produkte'}), 500

# =============================
# 🔐 ADMIN: BESTELLUNGEN LADEN
# =============================
@app.route('/admin/api/bestellungen', methods=['GET'])
def get_bestellungen():
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM bestellungen
            ORDER BY erstellt_datum DESC, erstellt_uhrzeit DESC
        """)
        result = cursor.fetchall()

        # FIX: timedelta → String
        for row in result:
            for key, value in row.items():
                if isinstance(value, timedelta):
                    row[key] = str(value)

        return jsonify(result), 200

    except Exception as e:
        print("❌ Fehler beim Laden der Bestellungen:", e)
        return jsonify({'error': 'Fehler beim Laden der Bestellungen.'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# =============================
# 🔐 ADMIN: ALLE ADRESSEN LADEN
# =============================
@app.route('/admin/api/adressen', methods=['GET'])
def get_adressen():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM adressen ORDER BY adresse_id DESC")
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        print("Fehler beim Laden der Adressen:", e)
        return jsonify({'error': 'Fehler beim Laden der Adressen'}), 500

# =============================
# 🔐 ADMIN: BESTELLUNG ANLEGEN
# =============================
@app.route('/admin/api/bestellung/anlegen', methods=['POST'])
def admin_bestellung_anlegen():
    data = request.get_json()

    gutscheincode = data.get("gutscheincode", "").strip()
    ean = data.get("produktId")
    kommentar = data.get("kommentar", "").strip()
    adresse = data.get("adresse", {})

    required_fields = [
        ean,
        adresse.get("anrede"),
        adresse.get("vorname"),
        adresse.get("nachname"),
        adresse.get("strasse"),
        adresse.get("hausnummer"),
        adresse.get("plz"),
        adresse.get("ort"),
        adresse.get("email"),
        kommentar
    ]
    if not all(required_fields):
        return jsonify({'error': 'Bitte alle Pflichtfelder ausfüllen.'}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT bestell_id FROM bestellungen 
            WHERE bestell_id REGEXP '^ND[0-9]{5}$'
            ORDER BY CAST(SUBSTRING(bestell_id, 3) AS UNSIGNED) DESC 
            LIMIT 1
        """)
        last = cursor.fetchone()
        bestell_id = f"ND{(int(last['bestell_id'][2:]) + 1):05d}" if last else "ND00001"

        erstellt_datum = datetime.now().date()
        erstellt_uhrzeit = datetime.now().time().replace(microsecond=0)

        cursor.execute("""
            INSERT INTO bestellungen (
                bestell_id, gutscheincode, ean, kommentar,
                anrede, vorname, nachname, firma,
                strasse, hausnummer, plz, ort,
                email, telefon,
                erstellt_datum, erstellt_uhrzeit
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            bestell_id, gutscheincode, ean, kommentar,
            adresse.get("anrede"), adresse.get("vorname"), adresse.get("nachname"),
            adresse.get("firma", ""), adresse.get("strasse"), adresse.get("hausnummer"),
            adresse.get("plz"), adresse.get("ort"), adresse.get("email"),
            adresse.get("telefon", ""), erstellt_datum, erstellt_uhrzeit
        ))

        conn.commit()
        return jsonify({'message': f'✅ Bestellung {bestell_id} erfolgreich gespeichert.'}), 200

    except Exception as e:
        print("Fehler beim Speichern:", e)
        conn.rollback()
        return jsonify({'error': 'Datenbankfehler beim Speichern.'}), 500
    finally:
        cursor.close()
        conn.close()

# =============================
# ✅ SERVER START
# =============================
if __name__ == '__main__':
    app.run(port=5000, debug=True)
