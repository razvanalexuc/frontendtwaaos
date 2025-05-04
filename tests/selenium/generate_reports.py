"""
Script pentru generarea rapoartelor de testare
"""

import os
import sys
import datetime
import pytest
import json
from test_metadata import APP_INFO, TEST_CATEGORIES, TEST_METADATA, REPORT_CONFIG

def generate_html_report():
    """Generează raport HTML folosind pytest-html."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = os.path.join(os.path.dirname(__file__), REPORT_CONFIG["output_dir"])
    
    # Creează directorul pentru rapoarte dacă nu există
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
    
    report_path = os.path.join(report_dir, f"test_report_{timestamp}.html")
    
    # Adaugă metadatele în raport - fără diacritice pentru a evita probleme de encoding
    metadata = {
        "Aplicatie": APP_INFO["name"],
        "Versiune": APP_INFO["version"],
        "Mediu": APP_INFO["environment"],
        "URL": APP_INFO["base_url"],
        "Data testarii": datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
        "Executat de": os.getenv("USERNAME", "Unknown")
    }
    
    # Construiește comanda pentru pytest
    cmd = [
        "-v",
        "--html=" + report_path,
        "--self-contained-html",
        "--capture=tee-sys"
    ]
    
    # Adaugă metadatele ca parametri pentru pytest
    for key, value in metadata.items():
        cmd.append(f"--metadata={key}={value}")
    
    # Adaugă directorul cu teste funcționale
    cmd.append("functional_tests/")
    
    # Execută pytest cu parametrii configurați
    print(f"Generare raport HTML: {report_path}")
    pytest.main(cmd)
    
    return report_path

def generate_json_report():
    """Generează raport JSON cu metadatele testelor."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = os.path.join(os.path.dirname(__file__), REPORT_CONFIG["output_dir"])
    
    # Creează directorul pentru rapoarte dacă nu există
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
    
    report_path = os.path.join(report_dir, f"test_metadata_{timestamp}.json")
    
    # Adaugă informații suplimentare
    report_data = {
        "app_info": APP_INFO,
        "test_categories": TEST_CATEGORIES,
        "test_metadata": TEST_METADATA,
        "report_generated_at": datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
        "report_generated_by": os.getenv("USERNAME", "Unknown")
    }
    
    # Scrie raportul JSON
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=4, ensure_ascii=False)
    
    print(f"Raport JSON generat: {report_path}")
    return report_path

def generate_summary_report():
    """Generează un raport sumar în format text."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = os.path.join(os.path.dirname(__file__), REPORT_CONFIG["output_dir"])
    
    # Creează directorul pentru rapoarte dacă nu există
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
    
    report_path = os.path.join(report_dir, f"test_summary_{timestamp}.txt")
    
    # Construiește conținutul raportului
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"{REPORT_CONFIG['title']}\n")
        f.write("=" * len(REPORT_CONFIG['title']) + "\n\n")
        f.write(f"{REPORT_CONFIG['description']}\n\n")
        
        f.write("Informații aplicație:\n")
        f.write("-" * 20 + "\n")
        for key, value in APP_INFO.items():
            f.write(f"{key}: {value}\n")
        f.write("\n")
        
        f.write("Categorii de teste:\n")
        f.write("-" * 20 + "\n")
        for key, value in TEST_CATEGORIES.items():
            f.write(f"{key}: {value}\n")
        f.write("\n")
        
        f.write("Teste configurate:\n")
        f.write("-" * 20 + "\n")
        for test_id, metadata in TEST_METADATA.items():
            f.write(f"Test: {metadata['name']}\n")
            f.write(f"  Descriere: {metadata['description']}\n")
            f.write(f"  Categorie: {metadata['category']}\n")
            f.write(f"  Prioritate: {metadata['priority']}\n")
            f.write(f"  Autor: {metadata['author']}\n")
            f.write(f"  Etichete: {', '.join(metadata['tags'])}\n")
            f.write("\n")
        
        f.write(f"Raport generat la: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}\n")
        f.write(f"Generat de: {os.getenv('USERNAME', 'Unknown')}\n")
    
    print(f"Raport sumar generat: {report_path}")
    return report_path

if __name__ == "__main__":
    # Creează directorul pentru rapoarte
    report_dir = os.path.join(os.path.dirname(__file__), REPORT_CONFIG["output_dir"])
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
    
    # Generează toate rapoartele
    html_report = generate_html_report()
    json_report = generate_json_report()
    summary_report = generate_summary_report()
    
    print("\nRapoarte generate cu succes:")
    print(f"1. Raport HTML: {html_report}")
    print(f"2. Raport JSON: {json_report}")
    print(f"3. Raport sumar: {summary_report}")
    print("\nDeschideți raportul HTML într-un browser pentru a vizualiza rezultatele detaliate ale testelor.")
