import csv
import os
import re
import smtplib
import secrets
import logging
from email.message import EmailMessage
from pathlib import Path
from string import Template
from functools import wraps
from flask import Flask, render_template, redirect, request, send_from_directory, jsonify, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
sender_email = os.environ.get("EMAIL")
sender_password = os.environ.get("EMAIL_PASSWORD")
secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(16))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = secret_key
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Rate limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Security headers
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://platform.linkedin.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=(), payment=()'
    return response

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<string:page_name>')
def html_page(page_name):
    redirects = {
        'resume_pdf': 'https://drive.google.com/uc?export=download&id=19VENKXyBNfUH79Moh3pygg1UbSkWwXLG',
        'resume': 'https://drive.google.com/drive/folders/1k-9myEHxvDqKJdI-hIdkjUws2rMZ6GS4?usp=sharing',
        'github': 'https://github.com/deepaksaipendyala',
        'linkedin': 'https://www.linkedin.com/in/deepaksaip',
        'Linkedin': 'https://www.linkedin.com/in/deepaksaip',
        'insta': 'https://www.instagram.com/deepak_sai.zip',
        'learnbert': 'https://drive.google.com/file/d/1VbCCM_W8dK4UAld3ZXVIMJrRp21j3f0r/view?usp=drive_link'
    }
    if page_name in redirects:
        return redirect(redirects[page_name])
    return render_template(page_name)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# API routes
@app.route('/api/projects', methods=['GET'])
def get_projects():
    # Example API endpoint to retrieve projects
    projects = [
        {
            "id": 1,
            "title": "AI-Powered 3D Printing Optimization",
            "description": "Developed machine learning solutions for 3D printing in a DARPA-funded project at NC State University.",
            "image": "/static/images/project1.jpg",
            "tags": ["Computer Vision", "Machine Learning", "DARPA", "Research"],
            "link": "https://github.com/deepaksaipendyala/3d-printing-ml"
        },
        {
            "id": 2,
            "title": "Generative AI Finance Tool",
            "description": "Led development of a Generative AI-based finance tool at Amazon with feedback-based retraining.",
            "image": "/static/images/project2.jpg",
            "tags": ["Generative AI", "MLOps", "AWS", "Amazon"],
            "link": "https://github.com/deepaksaipendyala/gen-ai-finance"
        }
    ]
    return jsonify(projects)

# Email validator
def is_valid_email(email):
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.fullmatch(regex, email) is not None

# Enhanced spam detection
def is_spam(email_body, min_word_count=8):
    # Enhanced spam detection with more comprehensive patterns
    suspicious_patterns = [
        r'winning prize', r'urgent response', r'click.*link',
        r'free vacation', r'guaranteed income', r'special offer',
        r'lottery', r'investment opportunity', r'deposit required',
        r'banking details', r'password', r'credit card', r'ssn',
        r'social security', r'bank account', r'money transfer'
    ]
    
    # Check for suspicious patterns
    for pattern in suspicious_patterns:
        if re.search(pattern, email_body.lower()):
            return True
    
    # Check for excessive capitalization
    if sum(1 for c in email_body if c.isupper()) > len(email_body) * 0.5:
        return True
    
    # Check for minimum word count
    if len(email_body.split()) < min_word_count:
        return True
    
    # Check for URLs and email addresses in the message
    if re.findall(r'https?://\S+|www\.\S+|\S+@\S+', email_body):
        return True
    
    return False

# Save to CSV with proper error handling
def write_to_csv(data):
    try:
        with open('./database.csv', mode='a', newline='') as db:
            writer = csv.writer(db, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerow([data["name"], data["email"], data["message"]])
        return True
    except Exception as e:
        logger.error(f"Error writing to CSV: {e}")
        return False

# Send confirmation to user with better error handling
def send_user_email(data):
    try:
        recipient = data["email"]
        name = data["name"]
        html_template = Template(Path('./templates/email.html').read_text())
        msg = EmailMessage()
        msg['from'] = 'Deepak Sai Pendyala'
        msg['to'] = recipient
        msg['subject'] = 'Your Feedback Received!'
        msg.set_content(html_template.substitute({'name': name}), 'html')

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Error sending user email: {e}")
        return False

# Send alert to yourself with better error handling
def send_admin_email(data):
    try:
        msg = EmailMessage()
        msg['from'] = 'Deepak Sai Pendyala'
        msg['to'] = 'deepak.pendyala.111@gmail.com'
        msg['subject'] = 'New Portfolio Feedback!'
        msg.set_content(
            f'Form received:\nSender Name: {data["name"]}\nSender Email: {data["email"]}\nMessage:\n{data["message"]}\nIP: {get_remote_address()}'
        )

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Error sending admin email: {e}")
        return False

# Main form submission route with rate limiting and CSRF protection
@app.route('/submit_form', methods=['POST'])
@limiter.limit("5 per minute")
def submit_form():
    if request.method == 'POST':
        try:
            data = request.form.to_dict()
            
            # Log the form submission attempt
            logger.info(f"Form submission from {get_remote_address()}")
            
            # Input validation
            if not data.get("name") or not data.get("email") or not data.get("message"):
                return jsonify({"error": "All fields are required"}), 400
                
            if not is_valid_email(data["email"]):
                return jsonify({"error": "Invalid email format"}), 400

            if is_spam(data["message"]):
                logger.warning(f"Potential spam detected from {get_remote_address()}")
                return jsonify({"error": "Message detected as potential spam"}), 400

            # Processing the form data
            csv_success = write_to_csv(data)
            user_email_success = send_user_email(data)
            admin_email_success = send_admin_email(data)
            
            if not csv_success:
                logger.error("Failed to save data to CSV")
                
            if not user_email_success:
                logger.error("Failed to send confirmation email to user")
                
            if not admin_email_success:
                logger.error("Failed to send notification email to admin")
                
            # Determine overall success
            if csv_success and (user_email_success or admin_email_success):
                return redirect('/thankyou.html')
            else:
                return jsonify({"error": "Partial processing failure"}), 500

        except Exception as error:
            logger.error(f"Error processing form: {error}")
            return jsonify({"error": "An unexpected error occurred"}), 500
    else:
        return jsonify({"error": "Method not allowed"}), 405

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

# Run it locally (for dev testing)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')
