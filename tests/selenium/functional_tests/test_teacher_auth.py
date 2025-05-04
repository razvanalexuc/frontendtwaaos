"""
Test pentru autentificarea in rolul Teacher.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from locators import TWAAOSLocators
from pages.homepage import HomePage
from pages.cadrudidacticpage import CadruDidacticPage

@pytest.mark.authentication
@pytest.mark.high_priority
@pytest.mark.parametrize("test_id", ["test_teacher_auth"])
def test_teacher_bypass_auth(driver, test_id):
    """Testeaza bypass-ul autentificarii pentru rolul Teacher.
    
    Metadate:
    - Categorie: authentication
    - Prioritate: High
    - Autor: TWAAOS Team
    - Tags: auth, teacher, bypass
    """
    # Inregistram metadatele testului in raport
    from test_metadata import TEST_METADATA
    metadata = TEST_METADATA.get(test_id, {})
    print(f"\nRulare test: {metadata.get('name', test_id)}")
    print(f"Descriere: {metadata.get('description', 'N/A')}")
    print(f"Prioritate: {metadata.get('priority', 'N/A')}\n")
    
    homepage = HomePage(driver)
    homepage.navigate_to_home_page()
    homepage.wait_for_page_load()
    homepage.choose_role("Cadru Didactic")
    homepage.press_bypass_google_auth_btn()
    cadru_didactic_page = CadruDidacticPage(driver)
    cadru_didactic_page.check_if_cadrudidactic_page()
    
    print(f"Test finalizat cu succes: {metadata.get('name', test_id)}")
