import csv
import os
import re
import smtplib
from email.message import EmailMessage
from pathlib import Path
from string import Template
from flask import Flask, render_template, redirect, request, send_from_directory

# Load environment variables
sender_email = os.environ.get("email")
sender_password = os.environ.get("password")

app = Flask(__name__)

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

# Save to text file
def write_to_database(data):
    with open('./database.txt', mode='a') as db:
        db.write(f'\n{data["name"]},{data["email"]},{data["message"]}')

# Save to CSV
def write_to_csv(data):
    with open('./database.csv', mode='a', newline='') as db:
        writer = csv.writer(db, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        writer.writerow([data["name"], data["email"], data["message"]])

# Send confirmation to user
def send_user_email(data):
    recipient = data["email"]
    name = data["name"]
    html_template = Template(Path('./templates/email.html').read_text())
    msg = EmailMessage()
    msg['from'] = 'Deepak Sai Pendyala'
    msg['to'] = recipient
    msg['subject'] = 'Your Feedback submitted!'
    msg.set_content(html_template.substitute({'name': name}), 'html')

    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(sender_email, sender_password)
        smtp.send_message(msg)

# Send alert to yourself
def send_admin_email(data):
    msg = EmailMessage()
    msg['from'] = 'Deepak Sai Pendyala'
    msg['to'] = 'deepak.pendyala.111@gmail.com'
    msg['subject'] = 'Feedback received!'
    msg.set_content(
        f'Form received:\nSender Name: {data["name"]}\nSender Email: {data["email"]}\nMessage:\n{data["message"]}'
    )

    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(sender_email, sender_password)
        smtp.send_message(msg)

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

            write_to_csv(data)
            write_to_database(data)
            send_user_email(data)
            send_admin_email(data)

            return redirect('/thankyou.html')

        except Exception as error:
            print(f"[ERROR] {error}")
            return '❌ Something went wrong while saving your data.'
    else:
        return '❌ Invalid request method. Use POST to submit form.'

# Run it locally (for dev testing)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

