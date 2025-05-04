"""
Script pentru rularea testelor marcate și generarea rapoartelor
"""

import os
import sys
import subprocess
import datetime
import argparse
from pathlib import Path

def create_reports_dir():
    """Creează directorul pentru rapoarte dacă nu există."""
    reports_dir = Path(__file__).parent / "reports"
    if not reports_dir.exists():
        reports_dir.mkdir(parents=True)
    return reports_dir

def run_all_tests():
    """Rulează toate testele marcate și generează rapoarte."""
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    html_report_path = reports_dir / f"test_report_{timestamp}.html"
    
    # Construiește comanda pentru rularea testelor
    cmd = [
        "python", "-m", "pytest",
        "functional_tests/",
        "-v",
        f"--html={html_report_path}",
        "--self-contained-html"
    ]
    
    print(f"\n{'=' * 80}")
    print("RULARE TESTE AUTOMATE PENTRU APLICATIA TWAAOS")
    print(f"{'=' * 80}")
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {html_report_path}")
    print(f"{'=' * 80}\n")
    
    # Execută comanda
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    print(f"\n{'=' * 80}")
    if result.returncode == 0:
        print("✅ TOATE TESTELE AU TRECUT CU SUCCES!")
    else:
        print("❌ UNELE TESTE AU ESUAT. Verificati raportul pentru detalii.")
    print(f"{'=' * 80}")
    print(f"Raport HTML generat: {html_report_path}")
    
    return result.returncode

def run_by_category(category):
    """Rulează testele dintr-o anumită categorie."""
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    html_report_path = reports_dir / f"test_report_{category}_{timestamp}.html"
    
    # Construiește comanda pentru rularea testelor
    cmd = [
        "python", "-m", "pytest",
        f"-m", category,
        "-v",
        f"--html={html_report_path}",
        "--self-contained-html"
    ]
    
    print(f"\n{'=' * 80}")
    print(f"RULARE TESTE DIN CATEGORIA '{category.upper()}' PENTRU APLICATIA TWAAOS")
    print(f"{'=' * 80}")
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {html_report_path}")
    print(f"{'=' * 80}\n")
    
    # Execută comanda
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    print(f"\n{'=' * 80}")
    if result.returncode == 0:
        print(f"✅ TOATE TESTELE DIN CATEGORIA '{category.upper()}' AU TRECUT CU SUCCES!")
    else:
        print(f"❌ UNELE TESTE DIN CATEGORIA '{category.upper()}' AU ESUAT. Verificati raportul pentru detalii.")
    print(f"{'=' * 80}")
    print(f"Raport HTML generat: {html_report_path}")
    
    return result.returncode

def run_by_priority(priority):
    """Rulează testele cu o anumită prioritate."""
    reports_dir = create_reports_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    html_report_path = reports_dir / f"test_report_{priority}_priority_{timestamp}.html"
    
    # Construiește comanda pentru rularea testelor
    cmd = [
        "python", "-m", "pytest",
        f"-m", f"{priority}_priority",
        "-v",
        f"--html={html_report_path}",
        "--self-contained-html"
    ]
    
    print(f"\n{'=' * 80}")
    print(f"RULARE TESTE CU PRIORITATE '{priority.upper()}' PENTRU APLICATIA TWAAOS")
    print(f"{'=' * 80}")
    print(f"Data si ora: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M:%S')}")
    print(f"Raport HTML: {html_report_path}")
    print(f"{'=' * 80}\n")
    
    # Execută comanda
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    print(f"\n{'=' * 80}")
    if result.returncode == 0:
        print(f"✅ TOATE TESTELE CU PRIORITATE '{priority.upper()}' AU TRECUT CU SUCCES!")
    else:
        print(f"❌ UNELE TESTE CU PRIORITATE '{priority.upper()}' AU ESUAT. Verificati raportul pentru detalii.")
    print(f"{'=' * 80}")
    print(f"Raport HTML generat: {html_report_path}")
    
    return result.returncode

def main():
    """Funcția principală pentru rularea testelor."""
    parser = argparse.ArgumentParser(description="Rulează teste automate pentru aplicația TWAAOS")
    parser.add_argument("--all", action="store_true", help="Rulează toate testele")
    parser.add_argument("--category", choices=["authentication", "functionality", "ui", "integration"], 
                        help="Rulează testele dintr-o anumită categorie")
    parser.add_argument("--priority", choices=["high", "medium", "low"], 
                        help="Rulează testele cu o anumită prioritate")
    
    args = parser.parse_args()
    
    if args.all:
        return run_all_tests()
    elif args.category:
        return run_by_category(args.category)
    elif args.priority:
        return run_by_priority(args.priority)
    else:
        # Implicit, rulează toate testele
        return run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
