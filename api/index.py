import sys
import os

# Get the parent directory (project root)
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add to Python path
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Change to project root
os.chdir(parent_dir)

# Import Flask app
from server import app

# Export for Vercel
handler = app
