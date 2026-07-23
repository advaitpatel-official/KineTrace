from datetime import datetime

def get_copyright_year() -> int:
    return datetime.now().year

def get_copyright_notice(name: str = "Advait Patel") -> str:
    return f"\u00a9 {name}, {get_copyright_year()}"