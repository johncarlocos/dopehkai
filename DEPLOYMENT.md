# Deployment Guide for Hostinger VPS

This guide will help you deploy the DOPE website on a Hostinger VPS server using port 4000.

## Prerequisites
- Hostinger VPS server with Node.js installed
- Another MERN website already running on port 3000
- Domain name (optional, for production)

## Backend Configuration

### 1. Environment Variables
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration
# Replace with your actual domain or server IP
CORS_ORIGIN=https://yourdomain.com
# Or if using IP: http://your-server-ip:4000

# Add other environment variables as needed
# (Firebase, database URLs, etc.)
```

### 2. Build and Start Backend
```bash
cd backend
npm install
npm run build
npm start
```

### 3. Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the backend with PM2
cd backend
pm2 start dist/server.js --name dope-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

## Frontend Configuration

### 1. Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
# For production, use your backend URL
VITE_API_URL=http://your-server-ip:4000/api/
# Or if using domain: https://api.yourdomain.com/api/
```

### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
```

The built files will be in `frontend/dist/`

### 3. Deploy Frontend
The backend already serves the frontend static files from `frontend/dist/`, so once the backend is running, the frontend will be served automatically.

## Nginx Configuration (Optional - for domain setup)

If you want to use a domain name with Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Firewall Configuration

Make sure port 4000 is open in your firewall:

```bash
# Ubuntu/Debian
sudo ufw allow 4000/tcp
sudo ufw reload

# Or for CentOS/RHEL
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload
```

## Verification

1. Check if backend is running:
   ```bash
   curl http://localhost:4000/api/config
   ```

2. Check if frontend is accessible:
   ```bash
   curl http://your-server-ip:4000
   ```

## Important Notes

- The backend serves both API routes (`/api/*`) and frontend static files
- Make sure the `frontend/dist` directory exists after building
- Update CORS_ORIGIN in backend `.env` to match your frontend domain
- Update VITE_API_URL in frontend `.env` to match your backend URL
- Both applications can run simultaneously on different ports (3000 and 4000)

