class SefGrupaPage:
    def __init__(self, driver):
        self.driver = driver
    
    def navigate_to_sefgrupa_page(self):
        self.driver.get("http://localhost:3000/sefgrupa")
    
    def is_sefgrupa_page(self):
        return "SefGrupa" in self.driver.title
    
    def check_if_sefgrupa_page(self):
        self.driver.implicitly_wait(10)
        panel = self.driver.find_element(By.CLASS_NAME, "group-leader-dashboard")
        assert "Panou Șef Grupă" in panel.text