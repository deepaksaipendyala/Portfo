# @author deepak sai pendyala
import csv
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path
from string import Template
from flask import Flask,render_template,url_for,redirect,request
import re

email = os.environ.get("email")
password = os.environ.get("password")

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/<string:page_name>')
def html_page(page_name):
    if(page_name=='resume_pdf'):
        return redirect('https://drive.google.com/uc?export=download&id=19VENKXyBNfUH79Moh3pygg1UbSkWwXLG')
    if(page_name=='resume'):
        return redirect('https://drive.google.com/drive/folders/1k-9myEHxvDqKJdI-hIdkjUws2rMZ6GS4?usp=sharing')
    if(page_name=='github'):
        return redirect('https://github.com/deepaksaipendyala')
    if(page_name=='linkedin'):
        return redirect('https://www.linkedin.com/in/deepaksaip')
    if(page_name=='Linkedin'):
        return redirect('https://www.linkedin.com/in/deepaksaip')
    if(page_name=='insta'):
        return redirect('https://www.instagram.com/deepak_sai.zip')
    if(page_name=='learnbert'):
        return redirect('https://drive.google.com/file/d/1VbCCM_W8dK4UAld3ZXVIMJrRp21j3f0r/view?usp=drive_link')
    return render_template(page_name)

# app.run(host='0.0.0.0', port=8080)

regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
def check(email):
    if(re.fullmatch(regex, email)):
        return True

    else:
        return False

def check_email_body_for_spam(email_body, min_word_count=8):
    # Define suspicious phrases commonly found in spam
    suspicious_phrases = [
        'winning prize', 'urgent response needed', 'click this link',
        'free vacation', 'guaranteed income', 'special offer'
    ]
    # Check for suspicious phrases
    for phrase in suspicious_phrases:
        if phrase in email_body.lower():
            return True
    # Check for excessive use of capital letters (e.g., more than 50% of the email body)
    if sum(1 for char in email_body if char.isupper()) > len(email_body) * 0.5:
        return True
    # Check for minimum word count
    if len(email_body.split()) < min_word_count:
        return True
    # Check for the presence of URLs or email addresses
    urls_or_emails = re.findall(r'https?://\S+|www\.\S+|\S+@\S+', email_body)
    if urls_or_emails:
        return True
    return False  # Email body does not seem to be spam


def write_to_database(data):
    with open('./Portfo/database.txt',mode='a')as database:
        name=data["name"]
        email=data["email"]
        message=data['message']
        database.write(f'\n {name},{email},{message}')
        database.close()

def write_to_csv(data):
    with open('./Portfo/database.csv',mode='a',newline='')as database2:
        name=data["name"]
        email=data["email"]
        message=data['message']
        csv_witer=csv.writer(database2,delimiter=',',quotechar='"',quoting=csv.QUOTE_MINIMAL)
        csv_witer.writerow([name,email,message])
        database2.close()
def email_sender(data):
    name = data["name"]
    emailid = data["email"]
    html = Template(Path('./Portfo/templates/email.html').read_text())
    email = EmailMessage()
    email['from'] = 'Deepak sai pendyala'
    email['to'] = emailid
    email['subject'] = 'Your Feedback submitted!'

    email.set_content(html.substitute({'name': name}), 'html')

    with smtplib.SMTP(host='smtp.gmail.com', port=587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(email, password)
        smtp.send_message(email)


def form_reminder(data):
    name = data["name"]
    emailid = data["email"]
    message = data['message']
    email = EmailMessage()
    email['from'] = 'Deepak sai pendyala'
    email['to'] = 'deepak.pendyala.111@gmail.com'
    email['subject'] = 'Feedback received!'

    email.set_content(f'Form received:\n sender name: {name}\n sender id: {emailid}\nmessage: {message}')
    with smtplib.SMTP(host='smtp.gmail.com', port=587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(email, password)
        smtp.send_message(email)


@app.route('/submit_form',methods=['POST','GET'])
def Sumbit_form():
    if request.method=='POST':
        try:
            data=request.form.to_dict()
            # Check if the email format is incorrect
            if not check(data["email"]):
                return 'Incorrect Email Format. Please enter a valid email.'

            # Check if the email body is spam or too short
            if check_email_body_for_spam(data["message"]):
                return 'Email Body Issue: Detected as Spam or too short. Please write a minimum of 10 words.'

            write_to_csv(data)
            write_to_database(data)
            email_sender(data)
            form_reminder(data)
            return redirect('/thankyou.html')
        except Exception as errr:
            raise errr
            return 'didnt save to database'
    else:
        return 'woops,Something went wrong'




# go to webserver path
# py -3 -m venv venv
# venv\Scripts\activate
# python3 -m pip install Flask
# set FLASK_APP=server.py
# $env:FLASK_APP = "server.py"
# $env:FLASK_ENV = "development"
# python3 -m flask run


