# Vercel Deployment Guide

This Flask application is now configured for Vercel deployment.

## Setup Steps

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   - Option A: Via Vercel Dashboard
     - Go to [vercel.com](https://vercel.com)
     - Import your GitHub repository
     - Vercel will automatically detect the Python configuration
   
   - Option B: Via CLI
     ```bash
     vercel
     ```

3. **Set Environment Variables**:
   In Vercel Dashboard → Project Settings → Environment Variables, add:
   - `RESEND_API_KEY`: Your Resend API key (from .env file)

4. **Deploy**:
   - Push to your main branch (auto-deploy)
   - Or manually deploy via CLI: `vercel --prod`

## File Structure

- `vercel.json` - Vercel configuration
- `api/index.py` - Serverless function entry point
- `server.py` - Main Flask application
- `requirements.txt` - Python dependencies

## Notes

- Static files are served through Flask's static folder
- Templates are loaded from the templates folder
- All routes are handled by the Flask app
- Environment variables are loaded from Vercel's environment (not .env file in production)

## Local Testing

You can still run locally with:
```bash
python server.py
```

Or test with Vercel CLI:
```bash
vercel dev
```
