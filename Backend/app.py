from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# DB-Verbindung konfigurieren
db_config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '',
    'database': 'gutscheinportal'
}

@app.route('/api/code-check', methods=['GET'])
def check_code():
    gutscheincode = request.args.get('gutscheincode', '').replace('-', '').strip()
    if not gutscheincode:
        return jsonify({'error': 'Kein Code übergeben'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # 1. Gutschein in 'bestand' finden
    query = """
        SELECT b.gutscheincode, b.typ, b.status, b.ean,
               p.produktname, p.beschreibung, p.bildpfad, p.einsatzorte
        FROM bestand b
        LEFT JOIN produkte p ON b.ean = p.ean
        WHERE b.gutscheincode = %s
    """
    cursor.execute(query, (gutscheincode,))
    result = cursor.fetchone()

    # ALT-CODE: Verknüpfte Produkte aus altcode_produktzuordnung holen
    if result and result["typ"] == "alt":
        cursor.execute("""
            SELECT p.ean, p.produktname, p.beschreibung, p.bildpfad, p.einsatzorte
            FROM altcode_produktzuordnung a
            JOIN produkte p ON a.ean = p.ean
            WHERE a.gutscheincode = %s
        """, (gutscheincode,))
        produkte = cursor.fetchall()

        for p in produkte:
            einsatzorte_raw = p.get("einsatzorte")
            p["einsatzorte"] = [s.strip() for s in einsatzorte_raw.split(",")] if einsatzorte_raw else []
            p["id"] = p.pop("ean")  # Frontend erwartet 'id'

        cursor.close()
        conn.close()

        return jsonify({
            "gutscheincode": result["gutscheincode"],
            "typ": result["typ"],
            "produkte": produkte
        })

    # NEU-CODE: Einzelnes Produkt zurückgeben
    if result:
        einsatzorte_raw = result.get("einsatzorte")
        einsatzorte_list = [s.strip() for s in einsatzorte_raw.split(",")] if einsatzorte_raw else []

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
        })

    cursor.close()
    conn.close()
    return jsonify({'error': 'Gutschein nicht gefunden'}), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
