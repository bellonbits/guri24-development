from app.main import app
from app.schemas.user import UserRegister
import sys

print("\n" + "="*50)
print("FASTAPI SYSTEM DIAGNOSTICS")
print("="*50)

# 1. Route Check
print("\n[1] ROUTE VERIFICATION")
print("-" * 30)
routes = [route.path for route in app.routes if hasattr(route, 'path')]
check_routes = [
    "/api/v1/admin/agents/pending",
    "/api/v1/admin/ping"
]
for r in check_routes:
    status = "✅ FOUND" if r in routes else "❌ MISSING"
    print(f"{status}: {r}")

# 2. Schema Check
print("\n[2] SCHEMA INSPECTION (UserRegister)")
print("-" * 30)
fields = list(UserRegister.model_fields.keys()) if hasattr(UserRegister, 'model_fields') else list(UserRegister.__fields__.keys())
print(f"Available Fields: {fields}")

if 'requested_role' in fields:
    print("✅ SUCCESS: 'requested_role' is present in the schema.")
    # Check default
    field_info = UserRegister.model_fields['requested_role'] if hasattr(UserRegister, 'model_fields') else UserRegister.__fields__['requested_role']
    default_val = getattr(field_info, 'default', 'No Default')
    print(f"   - Default value: {default_val}")
else:
    print("❌ ERROR: 'requested_role' is MISSING from the schema.")

# 3. Overall Status
print("\n" + "="*50)
if "/api/v1/admin/ping" in routes and 'requested_role' in fields:
    print("✨ SYSTEM STATUS: FULLY SYNCED AND READY")
else:
    print("⚠️  SYSTEM STATUS: OUTDATED / NOT SYNCED")
    print("\nACTION REQUIRED:")
    print("Run: docker-compose down && docker-compose up -d --build")
print("="*50 + "\n")
