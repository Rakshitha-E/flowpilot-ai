# FlowPilot Deployment Guide

## Prerequisites
- GitHub account
- Render account (https://render.com)

## Deployment Steps

### Option 1: Deploy with render.yaml (Recommended)

1. **Push your code to GitHub**
   
```
bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   
```

2. **Deploy on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply Blueprint"

### Option 2: Manual Deployment

#### Backend (API Service)

1. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com/
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `flowpilot-api`
     - Region: `Oregon`
     - Branch: `main`
     - Runtime: `Python 3`
     - Build Command: `cd backend && pip install -r requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Set Environment Variables**
   - In the Render dashboard, go to "Environment" tab
   - Add any required environment variables from your `.env` file

3. **Note your backend URL** (e.g., `https://flowpilot-api.onrender.com`)

#### Frontend (Static Site)

1. **Update API URL**
   - Edit `.env` file and replace with your Render backend URL:
     
```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     
```
   - Rebuild: `npm run build`
   - Push to GitHub

2. **Create a new Static Site on Render**
   - Click "New +" and select "Static Site"
   - Connect your GitHub repository
   - Configure:
     - Name: `flowpilot-frontend`
     - Region: `Oregon`
     - Branch: `main`
     - Build Command: `npm run build`
     - Publish directory: `dist`
     - Start Command: `npx serve -s dist -l $PORT`

3. **Configure SPA Routing**
   - In Render dashboard, go to "Redirects/Rewrites"
   - Add a rule:
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

## After Deployment

1. Your API will be available at: `https://flowpilot-api.onrender.com`
2. Your frontend will be available at: `https://flowpilot-frontend.onrender.com`
3. Test the endpoints:
   - `https://flowpilot-api.onrender.com/docs` - API documentation
   - `https://flowpilot-api.onrender.com/tasks` - Tasks endpoint

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend CORS configuration allows your frontend domain:
```
python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.onrender.com"],
    ...
)
```

### API Connection Issues
- Verify the `VITE_API_BASE_URL` is set correctly in your frontend
- Check browser console for specific error messages
