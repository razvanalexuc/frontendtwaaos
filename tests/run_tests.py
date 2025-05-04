import os
import sys
import subprocess
import argparse
from datetime import datetime

def run_tests(generate_report=False):
    """
    Ruleaza testele Selenium cu pytest si genereaza un raport HTML.
    
    Args:
        generate_report (bool): Daca ar trebui generat un raport HTML
    """
    # Creeaza directorul pentru rapoarte daca nu exista
    report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
    if not os.path.exists(report_dir):
        os.makedirs(report_dir)
    
    # Numele raportului cu timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = os.path.join(report_dir, f"test_report_{timestamp}.html")
    
    # Construieste comanda pentru rularea testelor
    test_dir = os.path.dirname(os.path.abspath(__file__))
    test_path = os.path.join(test_dir, "selenium")
    
    # Schimbam directorul curent pentru a putea importa modulul corect
    os.chdir(test_dir)
    
    # Folosim pytest pentru a rula testele
    cmd = [sys.executable, "-m", "pytest", test_path, "-v"]
    
    # Adauga optiuni pentru generarea raportului HTML
    if generate_report:
        cmd.extend(["--html", report_file, "--self-contained-html"])
    
    # Ruleaza testele
    print(f"Rulare teste din directorul selenium cu pytest...")
    process = subprocess.Popen(cmd)
    process.wait()
    
    if generate_report and process.returncode == 0:
        print(f"\nRaport HTML generat: {report_file}")
    
    return process.returncode

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ruleaza testele automate pentru TWAAOS")
    parser.add_argument("--report", action="store_true", help="Genereaza un raport HTML cu rezultatele testelor")
    
    args = parser.parse_args()
    
    # Asigura-te ca aplicatia este pornita
    print("Se presupune ca aplicatia TWAAOS ruleaza pe http://localhost:3000")
    print("Rulare teste...")
    
    # Ruleaza testele
    exit_code = run_tests(generate_report=args.report)
    
    # Iesi cu codul de iesire al testelor
    sys.exit(exit_code)
