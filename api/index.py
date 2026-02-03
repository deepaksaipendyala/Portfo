import os
import sys

# Ensure project root is on sys.path for module imports.
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Keep CWD at project root for any relative file access.
os.chdir(parent_dir)

# Expose the Flask WSGI app for Vercel.
from server import app
