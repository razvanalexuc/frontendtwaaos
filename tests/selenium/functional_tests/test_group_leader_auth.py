"""
Test pentru autentificarea in rolul Group Leader.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from locators import TWAAOSLocators
from pages.homepage import HomePage
from pages.sefgrupapage import SefGrupaPage

@pytest.mark.authentication
@pytest.mark.high_priority
@pytest.mark.parametrize("test_id", ["test_group_leader_auth"])
def test_group_leader_bypass_auth(driver, test_id):
    """Testeaza bypass-ul autentificarii pentru rolul Group Leader.
    
    Metadate:
    - Categorie: authentication
    - Prioritate: High
    - Autor: TWAAOS Team
    - Tags: auth, group-leader, bypass
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
    homepage.choose_role("Sef Grupa")
    homepage.press_bypass_google_auth_btn()
    sefgrupa_page = SefGrupaPage(driver)
    sefgrupa_page.check_if_sefgrupa_page()
    
    print(f"Test finalizat cu succes: {metadata.get('name', test_id)}")
    