# Quick Fix for Login Server Error

## Common Causes & Solutions

### 1. Backend Server Not Running
**Solution:**
```bash
cd campus-connect/campus-connect/backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on port 8080
```

### 2. Missing Environment Variables
Create a `.env` file in `backend/` folder with:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key-minimum-32-characters-long
NODE_ENV=development
```

### 3. Port Already in Use
If you see "EADDRINUSE" error:
```bash
# Windows PowerShell
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### 4. Database Connection Issue
- Check if MongoDB is running
- Verify MONGO_URI in .env file
- Test connection: `mongosh "your_connection_string"`

### 5. Check Server Health
Visit: `http://localhost:8080/api/v1/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "env": {
    "hasJwtSecret": true,
    "hasMongoUri": true,
    "nodeEnv": "development"
  }
}
```

## Testing Login

1. **Start Backend:**
   ```bash
   cd campus-connect/campus-connect/backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd campus-connect/campus-connect/frontend/app
   npm run dev
   ```

3. **Test Login:**
   - Email: `student@bitm.edu.in`
   - Password: `Campus@123`
   - Role: `Student`

## Debug Steps

1. Open browser console (F12)
2. Check Network tab for login request
3. Look at server console for error messages
4. Check if backend is accessible: `http://localhost:8080/`

## If Still Not Working

Check server console for:
- Database connection errors
- JWT_SECRET missing errors
- Import/module errors
- Port conflicts

