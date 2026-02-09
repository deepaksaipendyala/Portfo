import os
import re
from pathlib import Path
from string import Template
from flask import Flask, render_template, redirect, request, send_from_directory, abort
from dotenv import load_dotenv
import resend

# Load environment variables from .env file
load_dotenv()

# Initialize Resend with API key from environment
resend_api_key = os.environ.get("RESEND_API_KEY")
if resend_api_key:
    resend.api_key = resend_api_key

# Get the base directory (works for both local and Vercel)
# In Vercel, __file__ points to the deployed file location
BASE_DIR = Path(__file__).parent.absolute()

# Ensure paths exist, fallback to current working directory if needed
template_path = BASE_DIR / 'templates'
static_path = BASE_DIR / 'static'

# If paths don't exist, try using current working directory (for Vercel)
if not template_path.exists():
    template_path = Path(os.getcwd()) / 'templates'
if not static_path.exists():
    static_path = Path(os.getcwd()) / 'static'

app = Flask(__name__, 
            template_folder=str(template_path),
            static_folder=str(static_path))

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/sde')
def sde_home():
    return render_template('index.html', initial_track='sde')

@app.route('/ai')
@app.route('/ds')
def ai_home():
    return render_template('index.html', initial_track='ai')

@app.route('/<string:page_name>')
def html_page(page_name):
    redirects = {
        'resume_pdf': 'https://drive.google.com/uc?export=download&id=19VENKXyBNfUH79Moh3pygg1UbSkWwXLG',
        'resume': 'https://drive.google.com/drive/folders/1k-9myEHxvDqKJdI-hIdkjUws2rMZ6GS4?usp=sharing',
        'github': 'https://github.com/deepaksaipendyala',
        'linkedin': 'https://www.linkedin.com/in/deepaksaip',
        'Linkedin': 'https://www.linkedin.com/in/deepaksaip',
        'insta': 'https://www.instagram.com/deepaksaipendyala',
        'instagram': 'https://www.instagram.com/deepaksaipendyala',
        'learnbert': 'https://drive.google.com/file/d/1VbCCM_W8dK4UAld3ZXVIMJrRp21j3f0r/view?usp=drive_link',
        'schedule': 'https://calendly.com/deepaksaipendyala/30min',
        'meet': 'https://calendly.com/deepaksaipendyala/30min',
        'tree': 'https://linktr.ee/deepaksai',
        'linktree': 'https://linktr.ee/deepaksai',
        'youtube': 'https://www.youtube.com/c/GeeksfromIndia?sub_confirmation=1',
        'youtube': 'https://www.youtube.com/c/GeeksfromIndia?sub_confirmation=1'
    }
    if page_name in redirects:
        return redirect(redirects[page_name])
    if page_name.startswith('.') or '..' in page_name or '/' in page_name or '\\' in page_name:
        abort(404)
    if not page_name.endswith('.html'):
        abort(404)
    template_path = os.path.join(app.root_path, 'templates', page_name)
    if not os.path.isfile(template_path):
        abort(404)
    return render_template(page_name)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(str(BASE_DIR / 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Email validator
def is_valid_email(email):
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.fullmatch(regex, email) is not None

# Spam detection
def is_spam(email_body, min_word_count=8):
    suspicious_phrases = [
        'winning prize', 'urgent response needed', 'click this link',
        'free vacation', 'guaranteed income', 'special offer'
    ]
    if any(phrase in email_body.lower() for phrase in suspicious_phrases):
        return True
    if sum(1 for c in email_body if c.isupper()) > len(email_body) * 0.5:
        return True
    if len(email_body.split()) < min_word_count:
        return True
    if re.findall(r'https?://\S+|www\.\S+|\S+@\S+', email_body):
        return True
    return False

# Send confirmation to user
def send_user_email(data):
    recipient = data["email"]
    name = data["name"]
    html_template = Template((BASE_DIR / 'templates' / 'email.html').read_text())
    html_content = html_template.substitute({'name': name})
    
    params: resend.Emails.SendParams = {
        "from": "Deepak Sai Pendyala <forms@deepaksaip.me>",
        "to": [recipient],
        "subject": "Your Feedback submitted!",
        "html": html_content,
        "reply_to": "forms@deepaksaip.me"
    }
    
    email = resend.Emails.send(params)
    print(f"[INFO] User confirmation email sent: {email}")
    return email

# Send alert to yourself
def send_admin_email(data):
    email_body = f'''Form received:
    
Sender Name: {data["name"]}
Sender Email: {data["email"]}
Message:
{data["message"]}
'''
    
    params: resend.Emails.SendParams = {
        "from": "Deepak Sai Pendyala <forms@deepaksaip.me>",
        "to": ["deepak.pendyala.111@gmail.com"],
        "subject": "Feedback received!",
        "html": f"<pre>{email_body}</pre>",
        "reply_to": data["email"]
    }
    
    email = resend.Emails.send(params)
    print(f"[INFO] Admin notification email sent: {email}")
    return email

# Main form submission route
@app.route('/submit_form', methods=['POST', 'GET'])
def submit_form():
    if request.method == 'POST':
        try:
            data = request.form.to_dict()

            if not is_valid_email(data["email"]):
                return '❌ Invalid email format.'

            if is_spam(data["message"]):
                return '❌ Message looks like spam or is too short. Write at least 10 meaningful words.'

            if resend_api_key:
                try:
                    send_user_email(data)
                    send_admin_email(data)
                except Exception as email_error:
                    print(f"[ERROR] Failed to send emails: {email_error}")
            else:
                print("[WARNING] Resend API key not found. Skipping email sending.")

            return redirect('/thankyou.html')

        except Exception as error:
            print(f"[ERROR] {error}")
            return '❌ Something went wrong while processing your request.'
    else:
        return '❌ Invalid request method. Use POST to submit form.'

# Run it locally (for dev testing)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
