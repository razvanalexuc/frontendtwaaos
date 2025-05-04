"""
Script pentru rularea testelor si generarea rapoartelor HTML fara diacritice
"""

import os
import sys
import subprocess
import datetime
import argparse
from pathlib import Path
import re

def create_reports_dir():
    """Creeaza directorul pentru rapoarte."""
    reports_dir = Path(__file__).parent / "reports"
    if not reports_dir.exists():
        reports_dir.mkdir(parents=True)
    return reports_dir

def run_tests_with_ascii():
    """Ruleaza testele si genereaza raport HTML fara diacritice."""
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = reports_dir / f"test_report_{timestamp}.html"
    
    # Comanda pentru a rula testele cu encoding ASCII
    cmd = [
        "python", "-m", "pytest",
        "functional_tests/",
        "-v",
        f"--html={report_path}",
        "--self-contained-html"
    ]
    
    # Seteaza variabila de mediu pentru a forta encoding ASCII
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "ascii:replace"
    
    print("\n" + "=" * 80)
    print("RULARE TESTE AUTOMATE PENTRU APLICATIA TWAAOS")
    print("=" * 80)
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {report_path}")
    print("=" * 80 + "\n")
    
    # Ruleaza comanda cu encoding ASCII
    process = subprocess.run(cmd, env=env, cwd=Path(__file__).parent)
    
    print("\n" + "=" * 80)
    if process.returncode == 0:
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
    
    return process.returncode

def run_tests_by_category(category):
    """Ruleaza testele dintr-o categorie si genereaza raport HTML."""
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = reports_dir / f"test_report_{category}_{timestamp}.html"
    
    # Comanda pentru a rula testele cu encoding ASCII
    cmd = [
        "python", "-m", "pytest",
        f"-m", category,
        "-v",
        f"--html={report_path}",
        "--self-contained-html"
    ]
    
    # Seteaza variabila de mediu pentru a forta encoding ASCII
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "ascii:replace"
    
    print("\n" + "=" * 80)
    print(f"RULARE TESTE DIN CATEGORIA '{category.upper()}' PENTRU APLICATIA TWAAOS")
    print("=" * 80)
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {report_path}")
    print("=" * 80 + "\n")
    
    # Ruleaza comanda cu encoding ASCII
    process = subprocess.run(cmd, env=env, cwd=Path(__file__).parent)
    
    print("\n" + "=" * 80)
    if process.returncode == 0:
        print(f"TOATE TESTELE DIN CATEGORIA '{category.upper()}' AU TRECUT CU SUCCES!")
    else:
        print(f"UNELE TESTE DIN CATEGORIA '{category.upper()}' AU ESUAT. Verificati raportul pentru detalii.")
    print("=" * 80)
    print(f"Raport HTML generat: {report_path}")
    
    # Deschide raportul HTML in browser
    try:
        import webbrowser
        webbrowser.open(f"file://{report_path}")
        print("Raportul a fost deschis in browser.")
    except:
        print("Nu s-a putut deschide raportul in browser. Deschideti-l manual.")
    
    return process.returncode

def main():
    """Functia principala."""
    parser = argparse.ArgumentParser(description="Ruleaza teste si genereaza rapoarte HTML")
    parser.add_argument("--all", action="store_true", help="Ruleaza toate testele")
    parser.add_argument("--auth", action="store_true", help="Ruleaza testele de autentificare")
    parser.add_argument("--func", action="store_true", help="Ruleaza testele de functionalitate")
    
    args = parser.parse_args()
    
    if args.auth:
        return run_tests_by_category("authentication")
    elif args.func:
        return run_tests_by_category("functionality")
    else:
        # Implicit, ruleaza toate testele
        return run_tests_with_ascii()

if __name__ == "__main__":
    sys.exit(main())
