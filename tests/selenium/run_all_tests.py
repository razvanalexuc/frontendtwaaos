"""
Script principal pentru rularea tuturor testelor și generarea rapoartelor
"""

import os
import sys
import time
import argparse
import subprocess
from datetime import datetime
from test_metadata import APP_INFO, TEST_CATEGORIES, TEST_METADATA

def setup_arguments():
    """Configurează argumentele pentru linia de comandă."""
    parser = argparse.ArgumentParser(description="Rulează teste automate pentru aplicația TWAAOS")
    
    parser.add_argument("--html", action="store_true", help="Generează raport HTML")
    parser.add_argument("--json", action="store_true", help="Generează raport JSON cu metadate")
    parser.add_argument("--summary", action="store_true", help="Generează raport sumar text")
    parser.add_argument("--all-reports", action="store_true", help="Generează toate tipurile de rapoarte")
    parser.add_argument("--category", choices=TEST_CATEGORIES.keys(), help="Rulează doar testele din categoria specificată")
    parser.add_argument("--test", help="Rulează doar testul specificat (fără extensia .py)")
    parser.add_argument("--headless", action="store_true", help="Rulează testele în mod headless (fără interfață grafică)")
    parser.add_argument("--screenshots", action="store_true", help="Salvează capturi de ecran pentru teste eșuate")
    
    return parser.parse_args()

def run_tests(args):
    """Rulează testele în funcție de argumentele specificate."""
    print(f"\n{'=' * 80}")
    print(f"RULARE TESTE AUTOMATE PENTRU {APP_INFO['name']} v{APP_INFO['version']}")
    print(f"{'=' * 80}")
    print(f"Data si ora: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Mediu: {APP_INFO['environment']}")
    print(f"URL: {APP_INFO['base_url']}")
    print(f"{'=' * 80}\n")
    
    # Construiește comanda pentru pytest
    cmd = ["python", "-m", "pytest"]
    
    # Adaugă opțiuni pentru raportare
    if args.html or args.all_reports:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_dir = os.path.join(os.path.dirname(__file__), "reports")
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)
        html_path = os.path.join(report_dir, f"test_report_{timestamp}.html")
        cmd.extend(["--html", html_path, "--self-contained-html"])
    
    # Adaugă opțiuni pentru verbose și capturi de ecran
    cmd.append("-v")
    if args.screenshots:
        cmd.append("--screenshot=on")
    
    # Filtrează testele după categorie
    if args.category:
        test_files = []
        for test_id, metadata in TEST_METADATA.items():
            if metadata["category"] == args.category:
                test_files.append(f"functional_tests/{test_id}.py")
        
        if test_files:
            cmd.extend(test_files)
        else:
            print(f"Nu s-au găsit teste în categoria: {args.category}")
            return
    # Rulează un singur test specificat
    elif args.test:
        test_file = f"functional_tests/test_{args.test}.py"
        if os.path.exists(os.path.join(os.path.dirname(__file__), test_file)):
            cmd.append(test_file)
        else:
            print(f"Testul specificat nu există: {test_file}")
            return
    # Implicit, rulează toate testele
    else:
        cmd.append("functional_tests/")
    
    # Execută comanda pytest
    print(f"Comandă: {' '.join(cmd)}\n")
    start_time = time.time()
    result = subprocess.run(cmd, cwd=os.path.dirname(__file__))
    end_time = time.time()
    
    # Afișează rezultatele
    print(f"\n{'=' * 80}")
    print(f"REZULTATE TESTE")
    print(f"{'=' * 80}")
    print(f"Cod de ieșire: {result.returncode}")
    print(f"Durată: {end_time - start_time:.2f} secunde")
    
    # Generează rapoarte suplimentare
    if args.json or args.all_reports:
        print("\nGenerare raport JSON cu metadate...")
        subprocess.run([sys.executable, "generate_reports.py", "--json"], 
                      cwd=os.path.dirname(__file__))
    
    if args.summary or args.all_reports:
        print("\nGenerare raport sumar...")
        subprocess.run([sys.executable, "generate_reports.py", "--summary"], 
                      cwd=os.path.dirname(__file__))
    
    print(f"\n{'=' * 80}")
    if result.returncode == 0:
        print("✅ TOATE TESTELE AU TRECUT CU SUCCES!")
    else:
        print("❌ UNELE TESTE AU EȘUAT. Verificați rapoartele pentru detalii.")
    print(f"{'=' * 80}\n")
    
    return result.returncode

if __name__ == "__main__":
    args = setup_arguments()
    sys.exit(run_tests(args))
