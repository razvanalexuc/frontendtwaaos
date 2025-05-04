"""
Test pentru functionalitatea de Sign Out.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from locators import TWAAOSLocators
from pages.homepage import HomePage


@pytest.mark.authentication
@pytest.mark.high_priority
@pytest.mark.parametrize("test_id", ["test_sign_out"])
def test_sign_out_functionality(driver, test_id):
    """Testeaza functionalitatea de Sign Out.
    
    Metadate:
    - Categorie: authentication
    - Prioritate: High
    - Autor: TWAAOS Team
    - Tags: auth, sign-out
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
    homepage.sign_out_of_role()
    homepage.check_if_signed_out()
    
    print(f"Test finalizat cu succes: {metadata.get('name', test_id)}")
