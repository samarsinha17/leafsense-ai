from enum import Enum


class UserRole(str, Enum):
    guest = "guest"
    user = "user"
    admin = "admin"


class Severity(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"
