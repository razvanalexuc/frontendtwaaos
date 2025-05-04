"""
Fisier de configurare pentru pytest.
Contine fixture-uri comune pentru toate testele.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from webdriver_manager.chrome import ChromeDriverManager
import os

@pytest.fixture(scope="function")
def driver():
    """
    Fixture pentru initializarea WebDriver-ului Chrome.
    """
    try:
        # Initializam Chrome cu setari optimizate
        print("Initializam Chrome pentru teste...")
        
        # Configuram optiunile Chrome
        chrome_options = webdriver.ChromeOptions()
        
        # Setari pentru performanta
        chrome_options.add_argument("--start-maximized")  # Porneste browser-ul maximizat
        chrome_options.add_argument("--disable-infobars")  # Dezactiveaza barele de informare
        chrome_options.add_argument("--disable-extensions")  # Dezactiveaza extensiile
        chrome_options.add_argument("--disable-gpu")  # Dezactiveaza accelerarea GPU
        chrome_options.add_argument("--disable-dev-shm-usage")  # Dezactiveaza utilizarea /dev/shm
        chrome_options.add_argument("--no-sandbox")  # Dezactiveaza sandbox
        
        # Setari pentru securitate si confidentialitate
        chrome_options.add_argument("--incognito")  # Mod incognito pentru a evita cookie-urile salvate
        
        # Setari pentru debugging
        chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])  # Dezactiveaza logurile de debugging
        chrome_options.add_experimental_option("detach", True)  # Mentine browser-ul deschis dupa terminarea testului
        
        # Folosim calea explicita catre ChromeDriver
        chromedriver_path = r"C:\chromedriver\chromedriver.exe"
        print(f"Folosim ChromeDriver de la calea: {chromedriver_path}")
        
        # Verificam daca fisierul exista
        if not os.path.exists(chromedriver_path):
            print(f"EROARE: ChromeDriver nu exista la calea {chromedriver_path}")
            raise Exception(f"ChromeDriver nu exista la calea {chromedriver_path}")
        
        # Initializam Chrome cu calea explicita
        try:
            service = ChromeService(executable_path=chromedriver_path)
            driver = webdriver.Chrome(service=service, options=chrome_options)
            print("Chrome initializat cu succes folosind ChromeDriver de la calea specificata!")
        except Exception as e:
            print(f"Nu s-a putut initializa Chrome cu ChromeDriver de la calea specificata: {e}")
            raise Exception("Nu s-a putut initializa Chrome. Verificati daca versiunea ChromeDriver este compatibila cu versiunea Chrome instalata.")
        print("Chrome initializat cu succes!")
    except Exception as e:
        print(f"Nu s-a putut initializa Chrome: {e}")
        pytest.fail("Nu s-a putut initializa Chrome. Asigurati-va ca aveti Google Chrome instalat.")
        return None
    
    # Configurare browser
    driver.implicitly_wait(10)  # Asteptare implicita de 10 secunde
    
    # Setam timeout-uri pentru diferite operatii
    driver.set_page_load_timeout(30)  # Timeout pentru incarcarea paginii
    driver.set_script_timeout(30)  # Timeout pentru executarea scripturilor
    
    # Returnare driver pentru teste
    yield driver
    
    # Inchidere browser dupa test
    driver.quit()
