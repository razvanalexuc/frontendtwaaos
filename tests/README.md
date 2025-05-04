# Teste Automate pentru TWAAOS

Acest director conține teste automate pentru aplicația TWAAOS, folosind Python, Selenium și ChromeDriver pentru a verifica funcționalitățile de autentificare și deconectare.

## Structura proiectului

```
tests/
├── requirements.txt      # Dependențe Python necesare
├── run_tests.py          # Script pentru rularea testelor
├── README.md             # Acest fișier
└── selenium/             # Teste Selenium
    └── test_authentication.py  # Teste pentru autentificare
```

## Cerințe

- Python 3.8 sau mai nou
- Chrome browser instalat
- Aplicația TWAAOS rulând pe http://localhost:3000

## Instalare

1. Instalează dependențele Python:

```bash
pip install -r requirements.txt
```

## Rularea testelor

Asigură-te că aplicația TWAAOS rulează pe http://localhost:3000 înainte de a rula testele.

### Rulare simplă

```bash
python run_tests.py
```

### Rulare în mod headless (fără interfață grafică)

```bash
python run_tests.py --headless
```

### Generarea unui raport HTML

```bash
python run_tests.py --report
```

### Generarea unui raport HTML în mod headless

```bash
python run_tests.py --headless --report
```

## Teste implementate

1. **Bypass autentificare pentru Teacher**
   - Verifică dacă butonul de bypass pentru autentificare funcționează corect pentru rolul Teacher
   - Verifică dacă utilizatorul este autentificat și redirecționat la dashboard

2. **Bypass autentificare pentru Secretariat**
   - Verifică dacă butonul de bypass pentru autentificare funcționează corect pentru rolul Secretariat
   - Verifică dacă utilizatorul este autentificat și redirecționat la dashboard

3. **Bypass autentificare pentru Group Leader**
   - Verifică dacă butonul de bypass pentru autentificare funcționează corect pentru rolul Group Leader
   - Verifică dacă utilizatorul este autentificat și redirecționat la dashboard

4. **Funcționalitatea de Sign Out**
   - Verifică dacă butonul de Sign Out funcționează corect
   - Verifică dacă utilizatorul este deconectat și redirecționat la pagina de login
   - Verifică dacă token-ul de autentificare este șters din localStorage

## Extinderea testelor

Pentru a adăuga noi teste:

1. Creează un nou fișier Python în directorul `selenium/`
2. Importă clasa `unittest.TestCase` și implementează testele tale
3. Actualizează `run_tests.py` pentru a include noul fișier de test

## Troubleshooting

- Dacă întâmpini erori legate de ChromeDriver, asigură-te că ai Chrome instalat și că versiunea ChromeDriver este compatibilă cu versiunea Chrome.
- Dacă testele eșuează din cauza elementelor care nu pot fi găsite, verifică selectoarele CSS și asigură-te că aplicația TWAAOS rulează corect.
