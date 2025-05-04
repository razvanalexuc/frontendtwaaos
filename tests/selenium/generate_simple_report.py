"""
Script pentru generarea rapoartelor HTML simple, fara probleme de diacritice
"""

import os
import sys
import subprocess
import datetime
import argparse
import json
import re
from pathlib import Path

def remove_diacritics(text):
    """Elimina diacriticele din text."""
    replacements = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
        'ş': 's', 'ţ': 't', 'Ş': 'S', 'Ţ': 'T'
    }
    for diacritic, replacement in replacements.items():
        text = text.replace(diacritic, replacement)
    return text

def create_reports_dir():
    """Creeaza directorul pentru rapoarte."""
    reports_dir = Path(__file__).parent / "reports"
    if not reports_dir.exists():
        reports_dir.mkdir(parents=True)
    return reports_dir

def run_tests_and_capture_output(category=None):
    """Ruleaza testele si captureaza output-ul."""
    cmd = ["python", "-m", "pytest", "functional_tests/", "-v"]
    
    if category:
        cmd.append(f"-m{category}")
    
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path(__file__).parent)
    return result.stdout, result.returncode

def parse_test_results(output):
    """Parseaza rezultatele testelor din output-ul pytest."""
    tests = []
    
    # Regex pentru a extrage informatii despre teste
    test_pattern = r"functional_tests/(.*?)::(.+?)\[(.*?)\]\s+(PASSED|FAILED|SKIPPED|ERROR|XFAILED|XPASSED)"
    
    for match in re.finditer(test_pattern, output):
        file_name, test_name, param, result = match.groups()
        
        test_info = {
            "file": file_name,
            "name": test_name,
            "param": param,
            "result": result,
            "details": ""
        }
        
        # Daca testul a esuat, incearca sa gasesti detalii despre eroare
        if result == "FAILED":
            # Cauta detalii despre eroare dupa numele testului
            error_pattern = rf"{re.escape(file_name)}::{re.escape(test_name)}\[{re.escape(param)}\].*?FAILED.*?\n(.*?)(?=\n\n|$)"
            error_match = re.search(error_pattern, output, re.DOTALL)
            if error_match:
                test_info["details"] = error_match.group(1).strip()
        
        tests.append(test_info)
    
    return tests

def generate_html_report(tests, report_path, category=None):
    """Genereaza raport HTML din rezultatele testelor."""
    # Calculeaza statistici
    total = len(tests)
    passed = sum(1 for test in tests if test["result"] == "PASSED")
    failed = sum(1 for test in tests if test["result"] == "FAILED")
    skipped = sum(1 for test in tests if test["result"] == "SKIPPED")
    
    # Genereaza HTML
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Raport Teste TWAAOS</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
        .summary {{ background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 5px; }}
        .test-list {{ width: 100%; border-collapse: collapse; }}
        .test-list th {{ background-color: #4CAF50; color: white; text-align: left; padding: 8px; }}
        .test-list tr:nth-child(even) {{ background-color: #f2f2f2; }}
        .test-list td {{ padding: 8px; border-bottom: 1px solid #ddd; }}
        .passed {{ color: green; }}
        .failed {{ color: red; }}
        .skipped {{ color: orange; }}
        .details {{ font-family: monospace; white-space: pre-wrap; background-color: #f8f8f8; padding: 10px; border-left: 3px solid #ccc; margin-top: 5px; }}
    </style>
</head>
<body>
    <h1>Raport Teste Automate TWAAOS</h1>
    <div class="summary">
        <p><strong>Data si ora:</strong> {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}</p>
        <p><strong>Categorie:</strong> {category if category else "Toate testele"}</p>
        <p><strong>Total teste:</strong> {total}</p>
        <p><strong>Teste trecute:</strong> <span class="passed">{passed}</span></p>
        <p><strong>Teste esuate:</strong> <span class="failed">{failed}</span></p>
        <p><strong>Teste sarite:</strong> <span class="skipped">{skipped}</span></p>
    </div>
    
    <h2>Rezultate Detaliate</h2>
    <table class="test-list">
        <tr>
            <th>Fisier</th>
            <th>Test</th>
            <th>Parametru</th>
            <th>Rezultat</th>
        </tr>
"""
    
    # Adauga fiecare test in tabel
    for test in tests:
        result_class = test["result"].lower()
        html += f"""
        <tr>
            <td>{test["file"]}</td>
            <td>{test["name"]}</td>
            <td>{test["param"]}</td>
            <td class="{result_class}">{test["result"]}</td>
        </tr>"""
        
        # Adauga detalii despre eroare daca exista
        if test["details"]:
            html += f"""
        <tr>
            <td colspan="4">
                <div class="details">{test["details"]}</div>
            </td>
        </tr>"""
    
    html += """
    </table>
</body>
</html>
"""
    
    # Elimina diacriticele din HTML
    html = remove_diacritics(html)
    
    # Scrie raportul
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html)

def run_tests_and_generate_report(category=None):
    """Ruleaza testele si genereaza raport HTML."""
    # Creeaza directorul pentru rapoarte
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Genereaza numele fisierului de raport
    report_name = "test_report"
    if category:
        report_name += f"_{category}"
    report_name += f"_{timestamp}.html"
    
    report_path = reports_dir / report_name
    
    print("\n" + "=" * 80)
    print("RULARE TESTE AUTOMATE PENTRU APLICATIA TWAAOS")
    print("=" * 80)
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {report_path}")
    if category:
        print(f"Categorie: {category}")
    print("=" * 80 + "\n")
    
    # Ruleaza testele si captureaza output-ul
    output, returncode = run_tests_and_capture_output(category)
    
    # Parseaza rezultatele
    tests = parse_test_results(output)
    
    # Genereaza raportul HTML
    generate_html_report(tests, report_path, category)
    
    # Afiseaza rezultatul
    print("\n" + "=" * 80)
    if returncode == 0:
        print("TOATE TESTELE AU TRECUT CU SUCCES!")
    else:
        print("UNELE TESTE AU ESUAT. Verificati raportul pentru detalii.")
    print("=" * 80)
    print(f"Raport HTML generat: {report_path}")
    
    # Deschide raportul HTML in browser
    try:
        import webbrowser
        webbrowser.open(f"file://{report_path}")
        print("Raportul a fost deschis in browser.")
    except:
        print("Nu s-a putut deschide raportul in browser. Deschideti-l manual.")
    
    return returncode

def main():
    """Functia principala."""
    parser = argparse.ArgumentParser(description="Ruleaza teste si genereaza rapoarte HTML")
    parser.add_argument("--all", action="store_true", help="Ruleaza toate testele")
    parser.add_argument("--auth", action="store_true", help="Ruleaza testele de autentificare")
    parser.add_argument("--func", action="store_true", help="Ruleaza testele de functionalitate")
    
    args = parser.parse_args()
    
    if args.auth:
        return run_tests_and_generate_report("authentication")
    elif args.func:
        return run_tests_and_generate_report("functionality")
    else:
        # Implicit, ruleaza toate testele
        return run_tests_and_generate_report()

if __name__ == "__main__":
    sys.exit(main())
