import sys
import os

try:
    # Get the parent directory (project root)
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Add to Python path
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    # Change to project root
    os.chdir(parent_dir)
    
    # Import Flask app
    from server import app
    
    # Verify app is a Flask instance
    from flask import Flask
    if not isinstance(app, Flask):
        raise TypeError(f"Expected Flask instance, got {type(app)}")
    
    # Vercel Python runtime expects 'handler' to be a WSGI application
    handler = app
    
except Exception as e:
    import traceback
    print(f"Error initializing handler: {e}")
    traceback.print_exc()
    raise
