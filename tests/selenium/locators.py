"""
Locatori pentru elementele UI din aplicatia TWAAOS.
Acest fisier contine toti locatorii utilizati in testele automate.
"""

class TWAAOSLocators:
    """Clasa care contine toti locatorii pentru aplicatia TWAAOS."""
    
    # URL-uri pentru diferite pagini
    BASE_URL = "http://localhost:3000"
    TEACHER_URL = f"{BASE_URL}/teacher"
    SECRETARIAT_URL = f"{BASE_URL}/secretariat"
    GROUP_LEADER_URL = f"{BASE_URL}/groupLeader"
    
    # Selectori pentru butoane si elemente UI
    BYPASS_BUTTON = "button.test-button"
    SIGN_OUT_BUTTON = "button.signout-button"
    WELCOME_MESSAGE = ".user-welcome"
