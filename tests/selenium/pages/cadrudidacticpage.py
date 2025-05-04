from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
class CadruDidacticPage:
    def __init__(self, driver):
        self.driver = driver

    def check_if_cadrudidactic_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "teacher-dashboard")
        assert "Panou Cadru Didactic" in panel.text