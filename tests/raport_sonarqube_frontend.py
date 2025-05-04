import requests
import os
import datetime
import json

# === Configurare ===
SONARQUBE_URL = "http://localhost:9000"
PROJECT_KEY = "frontendtwaaos"  # înlocuiește cu projectKey-ul corect!
AUTH = ("admin", "")  # user și parolă

# === Cerere API ===
api_url = f"{SONARQUBE_URL}/api/issues/search"
params = {
    "componentKeys": PROJECT_KEY,
    "ps": 100  # numărul de probleme returnate
}

response = requests.get(api_url, auth=AUTH, params=params)

if response.status_code != 200:
    print("❌ Eroare la conectarea cu SonarQube:", response.text)
    exit()

data = response.json()
issues = data.get("issues", [])

if not issues:
    print("⚠️ Nu s-au găsit probleme în proiect.")
    exit()

# === Generare raport text ===
data_curenta = datetime.datetime.now().strftime("%d-%m-%Y %H:%M")

# Creare director pentru rapoarte dacă nu există
raports_dir = os.path.join(os.getcwd(), "tests", "reports")
os.makedirs(raports_dir, exist_ok=True)

# Nume fișier cu timestamp
timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
output_filename = f"sonarqube_report_{timestamp}.txt"
output_path = os.path.join(raports_dir, output_filename)

# Creare raport text
with open(output_path, "w", encoding="utf-8") as f:
    f.write(f"Raport SonarQube - {PROJECT_KEY}\n")
    f.write(f"Data generării: {data_curenta}\n")
    f.write("=" * 80 + "\n\n")
    
    if not issues:
        f.write("Nu s-au găsit probleme în proiect.\n")
    else:
        f.write(f"Total probleme găsite: {len(issues)}\n\n")
        
        # Grupare probleme după severitate
        severity_groups = {}
        for issue in issues:
            severity = issue.get("severity", "UNKNOWN")
            if severity not in severity_groups:
                severity_groups[severity] = []
            severity_groups[severity].append(issue)
        
        # Scrie probleme grupate după severitate
        for severity in ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"]:
            if severity in severity_groups:
                f.write(f"\n== Probleme cu severitate {severity}: {len(severity_groups[severity])} ==\n\n")
                
                for i, issue in enumerate(severity_groups[severity], 1):
                    message = issue.get("message", "Fără mesaj")
                    component = issue.get("component", "necunoscut")
                    line = issue.get("line", "-")
                    rule = issue.get("rule", "-")
                    
                    f.write(f"{i}. {message}\n")
                    f.write(f"   Fișier: {component}\n")
                    f.write(f"   Linia: {line}\n")
                    f.write(f"   Regula: {rule}\n\n")

# Salvează și un fișier JSON cu toate datele pentru analiză ulterioară
json_output_path = os.path.join(raports_dir, f"sonarqube_data_{timestamp}.json")
with open(json_output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Raport text generat cu succes: {output_path}")
print(f"Date JSON salvate în: {json_output_path}")