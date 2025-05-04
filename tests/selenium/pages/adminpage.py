from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class AdminPage:
    def __init__(self, driver):
        self.driver = driver

    def check_if_admin_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.XPATH, "//h2[normalize-space()='Administrator Login']")
        assert "Administrator Login" in panel.text

    def fill_admin_form(self):
        wait = WebDriverWait(self.driver, 10)
        username = wait.until(EC.presence_of_element_located((By.ID, "username")))
        password = wait.until(EC.presence_of_element_located((By.ID, "password")))
        login_button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "login-button")))

        username.clear()
        username.send_keys("admin")
        password.clear()
        password.send_keys("admin123")
        login_button.click()