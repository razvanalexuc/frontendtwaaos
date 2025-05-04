from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SecretariatPage:
    def __init__(self, driver):
        self.driver = driver
    
    def check_if_secretariat_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Secretariat Dashboard" in panel.text
    
    def check_if_disciplines_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Disciplines Management" in panel.text
    
    def check_if_rooms_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Examination Rooms" in panel.text
    
    def check_if_group_leaders_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Group Leaders Management" in panel.text
    
    def check_if_exam_periods_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Examination Periods Configuration" in panel.text
    
    def check_if_reports_page():
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "secretariat-dashboard")
        assert "Examination Reports" in panel.text

    def choose_tab(self, chosen_tab):
        """Alege un tab din panoul de secretariat.
        
        Args:
            chosen_tab: Poate fi un string (numele tab-ului) sau un int (indexul tab-ului)
        """
        self.driver.implicitly_wait(10)
        
        tabs_map = {
            'Disciplines': 0,
            'Rooms': 1,
            'Group Leaders': 2,
            'Exam Periods': 3,
            'Reports': 4,
        }   
        
        if isinstance(chosen_tab, int):
            tab_index = chosen_tab
        elif isinstance(chosen_tab, str) and chosen_tab in tabs_map:
            tab_index = tabs_map[chosen_tab]
        else:
            raise ValueError("Invalid tab: must be a known name or index")

        all_tabs = self.driver.find_elements(By.XPATH, "//div[contains(@class, 'dashboard-tabs')]/button")
        all_tabs[tab_index].click()
    
    def download_template(self):
        self.driver.implicitly_wait(10)
        download_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Download Template')]")
        download_button.click()

        notification = self.driver.find_element(By.CLASS_NAME, "notification")
        assert f"Template for disciplines downloaded successfully" in notification.text
    
    def generate_rooms_list(self):
        self.driver.implicitly_wait(10)
        generate_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Generate Rooms List')]")
        generate_button.click()
        notification = self.driver.find_element(By.CLASS_NAME, "notification")
        assert f"Rooms list generated successfully" in notification.text
    
    def notify_group_leaders(self):
        self.driver.implicitly_wait(10)
        notify_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Notify Group Leaders')]")
        notify_button.click()
        notification = self.driver.find_element(By.CLASS_NAME, "notification")
        assert f"Group leaders notified successfully" in notification.text
    
    def generate_disciplines(self):
        self.driver.implicitly_wait(10)
        generate_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Generate Disciplines List')]")
        generate_button.click()
        notification = self.driver.find_element(By.CLASS_NAME, "notification")
        assert f"Disciplines list generated successfully" in notification.text
    
    def download_reports(self,report_type):
        self.driver.implicitly_wait(10)
        report_button = self.driver.find_element(By.XPATH, f"//button[contains(text(), 'Download as{report_type}')]")
        report_button.click()
        notification = self.driver.find_element(By.CLASS_NAME, "notification")
        assert f"Exam schedule downloaded as {report_type}" in notification.text
        