#!/usr/bin/env python3
"""
OpenCV-based Person Detection Script
Detects persons in camera feed and sends detection events to Node.js
"""

import sys
import cv2
import time
import json

def detect_person(camera_id, faculty_id):
    """
    Continuously monitor camera feed and detect persons using OpenCV
    """
    # Initialize camera
    cap = cv2.VideoCapture(int(camera_id))
    
    if not cap.isOpened():
        print(f"ERROR: Could not open camera {camera_id}", file=sys.stderr)
        sys.exit(1)
    
    # Load pre-trained person detection model (HOG descriptor)
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    
    last_detection_time = None
    detection_interval = 2  # Check every 2 seconds
    
    print(f"Starting person detection for faculty {faculty_id} on camera {camera_id}", file=sys.stderr)
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("ERROR: Failed to read frame", file=sys.stderr)
                break
            
            # Resize frame for faster processing
            frame_resized = cv2.resize(frame, (640, 480))
            
            # Detect persons in the frame
            (rects, weights) = hog.detectMultiScale(
                frame_resized,
                winStride=(8, 8),
                padding=(32, 32),
                scale=1.05,
                hitThreshold=0.0,
                finalThreshold=2.0
            )
            
            # If person detected
            if len(rects) > 0:
                current_time = time.time()
                # Only emit detection event every few seconds to avoid spam
                if last_detection_time is None or (current_time - last_detection_time) >= detection_interval:
                    print("PERSON_DETECTED", flush=True)
                    last_detection_time = current_time
            
            # Small delay to reduce CPU usage
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("Detection stopped by user", file=sys.stderr)
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python detect_person.py <camera_id> <faculty_id>", file=sys.stderr)
        sys.exit(1)
    
    camera_id = sys.argv[1]
    faculty_id = sys.argv[2]
    detect_person(camera_id, faculty_id)

