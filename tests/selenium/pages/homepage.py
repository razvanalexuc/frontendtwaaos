from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
import time

class HomePage:
    def __init__(self, driver):
        self.driver = driver
    
    def navigate_to_home_page(self):
        self.driver.get("http://localhost:3000/")
    
    def wait_for_page_load(self):
        WebDriverWait(self.driver, 10).until(expected_conditions.visibility_of_element_located((By.XPATH, "//p[@class='subtitle animated-text']")))    
    
    def choose_role(self, role):
        role_element = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{role}')]")
        role_element.click()
    
    def press_bypass_google_auth_btn(self):
        bypass_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Bypass Google Auth')]")
        bypass_btn.click()
        time.sleep(3)

    def sign_out_of_role(self):
        sign_out_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Sign Out')]")
        sign_out_btn.click()
        time.sleep(3)

    def check_if_signed_out(self):
        try:
            # Verificăm dacă butonul de Sign Out nu mai este vizibil
            # Setăm un timeout mai mic pentru a nu aștepta prea mult când elementul nu există
            self.driver.implicitly_wait(3)
            sign_out_btn = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Sign Out')]")
            # Dacă nu găsim butonul sau nu este afișat, înseamnă că utilizatorul este deconectat
            assert len(sign_out_btn) == 0 or not sign_out_btn[0].is_displayed(), "Utilizatorul nu a fost deconectat corect"
            return True
        except Exception as e:
            # Resetăm timeout-ul implicit
            self.driver.implicitly_wait(10)
            # Verificăm dacă există un buton de bypass sau alt element care confirmă deconectarea
            bypass_btn = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Bypass Google Auth')]")
            assert len(bypass_btn) > 0 and bypass_btn[0].is_displayed(), "Utilizatorul nu a fost deconectat corect"

    def is_home_page(self):
        return "Home" in self.driver.title