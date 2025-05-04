"""
Script simplu pentru rularea testelor si generarea rapoartelor HTML
"""

import os
import sys
import subprocess
import datetime
import argparse
from pathlib import Path

def run_tests(test_path=None, category=None, priority=None):
    """Ruleaza testele si genereaza raport HTML."""
    # Creeaza directorul pentru rapoarte daca nu exista
    reports_dir = Path(__file__).parent / "reports"
    if not reports_dir.exists():
        reports_dir.mkdir(parents=True)
    
    # Genereaza numele fisierului de raport
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_name = "test_report"
    if category:
        report_name += f"_{category}"
    if priority:
        report_name += f"_{priority}_priority"
    report_name += f"_{timestamp}.html"
    
    report_path = reports_dir / report_name
    
    # Construieste comanda pentru pytest
    cmd = ["python", "-m", "pytest", "-v", f"--html={report_path}", "--self-contained-html"]
    
    # Adauga filtrarea dupa categorie sau prioritate
    if category:
        cmd.append(f"-m{category}")
    elif priority:
        cmd.append(f"-m{priority}_priority")
    
    # Adauga calea testelor
    if test_path:
        cmd.append(test_path)
    else:
        cmd.append("functional_tests/")
    
    # Afiseaza informatii despre rulare
    print("\n" + "=" * 80)
    print("RULARE TESTE AUTOMATE PENTRU APLICATIA TWAAOS")
    print("=" * 80)
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {report_path}")
    print("=" * 80 + "\n")
    
    # Ruleaza comanda
    process = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    # Afiseaza rezultatul
    print("\n" + "=" * 80)
    if process.returncode == 0:
        print("TOATE TESTELE AU TRECUT CU SUCCES!")
    else:
        print("UNELE TESTE AU ESUAT. Verificati raportul pentru detalii.")
    print("=" * 80)
    print(f"Raport HTML generat: {report_path}")
    
    return process.returncode

def main():
    """Functia principala."""
    parser = argparse.ArgumentParser(description="Ruleaza teste si genereaza rapoarte HTML")
    parser.add_argument("--all", action="store_true", help="Ruleaza toate testele")
    parser.add_argument("--auth", action="store_true", help="Ruleaza testele de autentificare")
    parser.add_argument("--func", action="store_true", help="Ruleaza testele de functionalitate")
    parser.add_argument("--high", action="store_true", help="Ruleaza testele cu prioritate inalta")
    parser.add_argument("--medium", action="store_true", help="Ruleaza testele cu prioritate medie")
    parser.add_argument("--test", help="Ruleaza un test specific (ex: test_teacher_auth.py)")
    
    args = parser.parse_args()
    
    if args.auth:
        return run_tests(category="authentication")
    elif args.func:
        return run_tests(category="functionality")
    elif args.high:
        return run_tests(priority="high")
    elif args.medium:
        return run_tests(priority="medium")
    elif args.test:
        test_path = f"functional_tests/{args.test}"
        if not args.test.startswith("test_"):
            test_path = f"functional_tests/test_{args.test}"
        if not args.test.endswith(".py"):
            test_path += ".py"
        return run_tests(test_path=test_path)
    else:
        # Implicit, ruleaza toate testele
        return run_tests()

if __name__ == "__main__":
    sys.exit(main())
