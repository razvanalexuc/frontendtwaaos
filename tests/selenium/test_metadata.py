"""
Metadate pentru testele automate TWAAOS
"""

# Informații despre aplicație
APP_INFO = {
    "name": "TWAAOS - Timetable Web Application for Academic Organizations and Students",
    "version": "1.0.0",
    "environment": "Development",
    "base_url": "http://localhost:3000"
}

# Categorii de teste
TEST_CATEGORIES = {
    "authentication": "Teste pentru autentificare și bypass Google Auth",
    "functionality": "Teste pentru funcționalitățile aplicației",
    "ui": "Teste pentru interfața utilizator",
    "integration": "Teste de integrare între componente"
}

# Metadate pentru teste individuale
TEST_METADATA = {
    "test_teacher_auth": {
        "name": "Autentificare Cadru Didactic",
        "description": "Verifică funcționalitatea de bypass Google Auth pentru rolul Cadru Didactic",
        "category": "authentication",
        "priority": "High",
        "author": "TWAAOS Team",
        "tags": ["auth", "teacher", "bypass"]
    },
    "test_secretariat_auth": {
        "name": "Autentificare Secretariat",
        "description": "Verifică funcționalitatea de bypass Google Auth pentru rolul Secretariat",
        "category": "authentication",
        "priority": "High",
        "author": "TWAAOS Team",
        "tags": ["auth", "secretariat", "bypass"]
    },
    "test_group_leader_auth": {
        "name": "Autentificare Șef Grupă",
        "description": "Verifică funcționalitatea de bypass Google Auth pentru rolul Șef Grupă",
        "category": "authentication",
        "priority": "High",
        "author": "TWAAOS Team",
        "tags": ["auth", "group-leader", "bypass"]
    },
    "test_admin_login": {
        "name": "Autentificare Admin",
        "description": "Verifică funcționalitatea de autentificare pentru rolul Admin",
        "category": "authentication",
        "priority": "High",
        "author": "TWAAOS Team",
        "tags": ["auth", "admin", "login"]
    },
    "test_sign_out": {
        "name": "Deconectare",
        "description": "Verifică funcționalitatea de Sign Out pentru toate rolurile",
        "category": "authentication",
        "priority": "High",
        "author": "TWAAOS Team",
        "tags": ["auth", "sign-out"]
    },
    "test_download_template": {
        "name": "Descărcare Template Discipline",
        "description": "Verifică funcționalitatea de descărcare a template-ului pentru discipline",
        "category": "functionality",
        "priority": "Medium",
        "author": "TWAAOS Team",
        "tags": ["secretariat", "download", "template"]
    },
    "test_generate_rooms_list": {
        "name": "Generare Listă Săli",
        "description": "Verifică funcționalitatea de generare a listei de săli",
        "category": "functionality",
        "priority": "Medium",
        "author": "TWAAOS Team",
        "tags": ["secretariat", "rooms", "generate"]
    },
    "test_notify_group_leaders": {
        "name": "Notificare Șefi Grupă",
        "description": "Verifică funcționalitatea de notificare a șefilor de grupă",
        "category": "functionality",
        "priority": "Medium",
        "author": "TWAAOS Team",
        "tags": ["secretariat", "notification", "group-leaders"]
    },
    "test_generate_disciplines": {
        "name": "Generare Listă Discipline",
        "description": "Verifică funcționalitatea de generare a listei de discipline",
        "category": "functionality",
        "priority": "Medium",
        "author": "TWAAOS Team",
        "tags": ["secretariat", "disciplines", "generate"]
    },
    "test_download_exam_schedule": {
        "name": "Descărcare Orar Examene",
        "description": "Verifică funcționalitatea de descărcare a orarului de examene",
        "category": "functionality",
        "priority": "Medium",
        "author": "TWAAOS Team",
        "tags": ["secretariat", "download", "schedule"]
    }
}

# Configurație pentru raportare
REPORT_CONFIG = {
    "title": "Raport Teste Automate TWAAOS",
    "description": "Raport detaliat al testelor automate pentru aplicația TWAAOS",
    "logo": "logo.png",
    "output_dir": "reports",
    "include_screenshots": True,
    "include_console_logs": True,
    "include_metadata": True
}
