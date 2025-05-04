
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from locators import TWAAOSLocators
from pages.homepage import HomePage
from pages.secretariatpage import SecretariatPage

@pytest.mark.functionality
@pytest.mark.medium_priority
@pytest.mark.parametrize("test_id", ["test_notify_group_leaders"])
def test_notify_group_leaders(driver, test_id):      
    """Testeaza functionalitatea de notificare a sefilor de grupa.
    
    Metadate:
    - Categorie: functionality
    - Prioritate: Medium
    - Autor: TWAAOS Team
    - Tags: secretariat, notification, group-leaders
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
    homepage.choose_role("Secretariat")
    homepage.press_bypass_google_auth_btn()
    secretariat_page = SecretariatPage(driver)
    secretariat_page.check_if_secretariat_page()

    secretariat_page.choose_tab("Group Leaders")
    secretariat_page.notify_group_leaders()
    
    print(f"Test finalizat cu succes: {metadata.get('name', test_id)}")