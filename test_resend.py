import os
from dotenv import load_dotenv
import resend

# Load environment variables from .env file
load_dotenv()

# Initialize Resend with API key from environment
resend_api_key = os.environ.get("RESEND_API_KEY")

if not resend_api_key:
    print("ERROR: RESEND_API_KEY not found in environment variables or .env file")
    print("Please make sure you have RESEND_API_KEY in your .env file")
    exit(1)

resend.api_key = resend_api_key

print("Testing Resend with custom domain deepaksaip.me...")
print(f"API Key found: {resend_api_key[:10]}...{resend_api_key[-4:] if len(resend_api_key) > 14 else '***'}")

# Test email parameters
params: resend.Emails.SendParams = {
    "from": "Deepak Sai Pendyala <forms@deepaksaip.me>",
    "to": ["deepak.pendyala.111@gmail.com"],
    "subject": "Test Email from Portfolio",
    "html": "<p>This is a test email from your portfolio website using Resend with custom domain deepaksaip.me</p><p>If you received this, it works!</p>",
    "reply_to": "forms@deepaksaip.me"
}

try:
    email = resend.Emails.send(params)
    print(f"\nSUCCESS! Email sent successfully!")
    print(f"Email ID: {email.get('id', 'N/A')}")
    print(f"Response: {email}")
except Exception as e:
    print(f"\nERROR: Failed to send email")
    print(f"Error details: {e}")
    print("\nPossible issues:")
    print("1. API key might be incorrect")
    print("2. Custom domain deepaksaip.me might not be verified in Resend")
    print("3. Check Resend dashboard for domain verification status")
