import sys
import os

# Add parent directory to path so we can import server
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Change to parent directory to ensure relative paths work
os.chdir(parent_dir)

try:
    from server import app
except Exception as e:
    print(f"Error importing server: {e}")
    import traceback
    traceback.print_exc()
    raise

# Vercel expects the app to be exposed as 'handler'
handler = app
