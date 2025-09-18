# DailyEarn Frontend

## 🚀 Development Setup

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Backend server running on `http://localhost:3005`
- MongoDB connection configured

### Quick Start

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd dailyearn-frontend

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

## 🔧 Session Configuration

### Vite Proxy Setup
This project uses Vite's proxy feature to solve cross-origin session cookie issues:

- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:3005`
- **Proxy**: `/api` routes → `http://localhost:3005`

### Axios Configuration
- **Base URL**: `/api` (uses Vite proxy)
- **Credentials**: `withCredentials: true` (enables cookies)
- **CORS**: Handled automatically through proxy

## 📁 Project Structure

```
src/
├── lib/
│   └── axios.ts          # Axios instance with proxy configuration
├── contexts/
│   └── AuthContext.tsx   # Authentication context
└── components/            # React components
```

## 🧪 Testing Session Fixes

### Quick Test
```bash
# In backend directory
node test-proxy.js
```

### Full Integration Test
```bash
# In backend directory
node test-session-integration.js
```

### Manual Testing
1. Open browser to `http://localhost:8080`
2. Check Network tab for cookie headers
3. Verify session persistence across refreshes

## 🚨 Important Notes

1. **Restart Required**: After changing Vite config, restart the dev server
2. **Proxy Routes**: All API calls should use `/api` prefix
3. **Cookies**: Sessions work through same-origin proxy, not cross-origin
4. **Environment**: No `.env` file needed in frontend for local development

## 🔍 Troubleshooting

### Sessions Not Persisting
- Ensure backend is running on port 3005
- Check that Vite proxy is configured correctly
- Verify axios baseURL is set to `/api`
- Restart frontend dev server after config changes

### CORS Errors
- Frontend should use proxy routes (`/api/*`)
- Backend should have `FRONTEND_ORIGIN=http://localhost:8080`
- Check browser console for specific error messages

## 📚 Additional Resources

- [Session Fix Testing Guide](../backend/TESTING_GUIDE.md)
- [Environment Configuration](../backend/env.example)
- [Backend Session Documentation](../backend/README.md)
