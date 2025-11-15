# Camera-Based Presence Detection Setup Guide

## Overview
The camera-based presence detection system automatically detects when a faculty member is present in their cabin using computer vision (OpenCV). The system continuously monitors the camera feed and updates the faculty status accordingly.

## Features
- ✅ Automatic person detection using OpenCV
- ✅ Real-time status updates (Present/Absent)
- ✅ Configurable absence timeout (default: 30 seconds)
- ✅ Manual override option (faculty can manually set status)
- ✅ Web-based fallback detection (if Python/OpenCV not available)

## Setup Instructions

### Option 1: Python + OpenCV (Recommended for Production)

1. **Install Python Dependencies:**
   ```bash
   cd backend/src/scripts
   pip install -r requirements.txt
   ```

2. **Verify Installation:**
   ```bash
   python detect_person.py --help
   ```

3. **Make Script Executable (Linux/Mac):**
   ```bash
   chmod +x detect_person.py
   ```

4. **Test Camera Access:**
   ```bash
   python detect_person.py 0 test_faculty_id
   ```

### Option 2: Web-Based Detection (Fallback)

If Python/OpenCV is not available, the system will automatically use web-based detection where:
- Frontend captures frames from webcam
- Frames are sent to backend every 2 seconds
- Backend processes frames (simpler motion detection)

This method works without Python but is less accurate than OpenCV-based detection.

## Usage

### For Faculty Members:

1. **Enable Auto Detection:**
   - Go to Faculty Dashboard
   - Find "Auto Camera Detection" section
   - Click "Start Detection"
   - Grant camera permissions when prompted

2. **Configure Timeout:**
   - Set "Absence Timeout" (10-120 seconds)
   - This is how long the system waits before marking you as "Absent"

3. **Manual Override:**
   - You can still manually update your status
   - Manual updates will override automatic detection
   - To re-enable auto-detection, stop and restart it

### API Endpoints:

- `POST /api/v1/faculty-availability/camera/start` - Start detection
- `POST /api/v1/faculty-availability/camera/stop` - Stop detection
- `GET /api/v1/faculty-availability/camera/status` - Get detection status
- `POST /api/v1/faculty-availability/camera/process-frame` - Process frame (internal)

## How It Works

1. **Detection Process:**
   - Camera feed is continuously monitored
   - OpenCV HOG (Histogram of Oriented Gradients) detector identifies persons
   - When person detected → Status = "Present"
   - After timeout with no detection → Status = "Absent"

2. **Status Updates:**
   - Automatic updates sync with `FacultyStatus` model
   - Real-time updates via Socket.io
   - Manual overrides take precedence

3. **Timeout Logic:**
   - Default: 30 seconds
   - If no person detected for timeout duration → "Absent"
   - Detection resets timeout timer

## Troubleshooting

### Camera Not Accessible
- Check browser permissions
- Ensure no other application is using the camera
- Try a different camera device ID (0, 1, 2, etc.)

### Python Script Not Working
- Verify Python 3.x is installed: `python --version`
- Install OpenCV: `pip install opencv-python`
- Check camera device ID is correct

### Detection Not Accurate
- Ensure good lighting in cabin
- Position camera to capture entire cabin area
- Adjust detection sensitivity in Python script if needed

## Security & Privacy

- Camera feed is processed locally/on server
- No video is stored permanently
- Only detection events are logged
- Faculty can disable detection anytime
- Manual override always available

## Future Enhancements

- Face recognition for specific faculty identification
- Multiple camera support
- Detection sensitivity adjustment
- Historical detection logs
- Mobile app support

