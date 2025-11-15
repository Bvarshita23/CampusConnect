# 🔧 Troubleshooting Login Server Error

## Common Issues & Solutions

### 1. **Backend Server Not Running**
**Symptom:** "Server error. Please try again later." or "Cannot connect to server"

**Solution:**
```bash
# Navigate to backend folder
cd campus-connect/backend

# Install dependencies (if not done)
npm install

# Start the server
npm start
# OR
node src/server.js
```

**Expected Output:**
```
✅ MongoDB connected: ...
✅ Server running on port 8080
```

---

### 2. **CORS Error**
**Symptom:** Network error in browser console, CORS policy error

**Solution:** ✅ **FIXED** - Updated `server.js` to allow ports 5173, 5174, and 3000

**If still having issues, restart the backend server after the fix.**

---

### 3. **Database Connection Issue**
**Symptom:** "Mongo connection error" in backend console

**Solution:**
- Check if MongoDB is running
- Verify `.env` file has correct `MONGO_URI`
- Example: `MONGO_URI=mongodb://localhost:27017/campusconnect`

---

### 4. **Missing Environment Variables**
**Symptom:** "Server configuration error" or JWT errors

**Solution:** Create/check `.env` file in `backend/` folder:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/campusconnect
JWT_SECRET=your-secret-key-here-min-32-chars
NODE_ENV=development
```

---

### 5. **Port Mismatch**
**Symptom:** Connection refused errors

**Check:**
- Frontend calls: `http://localhost:8080/api/v1/auth/login`
- Backend runs on: Port 8080 (default)
- If backend uses different port, update frontend `LoginPage.jsx` line 35

---

### 6. **Role Validation Error**
**Symptom:** "This account is registered as X, not Y"

**Solution:** Select the correct role in the dropdown that matches the user's actual role in the database.

---

## Quick Test Steps

1. **Check Backend Status:**
   ```bash
   # In backend folder
   npm start
   ```
   Should see: `✅ Server running on port 8080`

2. **Test API Directly:**
   Open browser: `http://localhost:8080/`
   Should see: "Campus Connect backend is running 🚀"

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try login
   - Check the `/api/v1/auth/login` request
   - Look for error details

4. **Check Backend Console:**
   - Look for error messages
   - Check MongoDB connection status
   - Verify JWT_SECRET is set

---

## Default Test Credentials

**Super Admin:**
- Email: `superadmin@campusconnect.com`
- Password: `Super@123`
- Role: `Super Admin`

---

## Still Having Issues?

1. Check backend console for detailed error messages
2. Check browser console (F12) for network errors
3. Verify MongoDB is running
4. Verify all environment variables are set
5. Restart both frontend and backend servers

