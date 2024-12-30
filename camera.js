function startCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let stream; // Store the video stream for stopping later

    // Access the user's camera
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((streamResult) => {
            stream = streamResult;
            video.srcObject = stream;

            video.onloadedmetadata = () => {
                video.play();

                // Set canvas dimensions to match video size
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                console.log('Camera initialized. Video dimensions:', video.videoWidth, video.videoHeight);

                // Start detecting faces
                const detectFaceInterval = setInterval(() => {
                    faceapi
                        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
                        .withFaceLandmarks()
                        .withFaceDescriptors()
                        .then((detections) => {
                            if (detections.length > 0) {
                                // Select the face with the highest confidence
                                const bestDetection = detections.reduce((max, detection) =>
                                    detection.detection._score > max.detection._score ? detection : max
                                );

                                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                                const resizedDetections = faceapi.resizeResults([bestDetection], displaySize);

                                // Clear the canvas and draw the face landmarks and bounding box
                                context.clearRect(0, 0, canvas.width, canvas.height);
                                faceapi.draw.drawDetections(canvas, resizedDetections);
                                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                                // Check for 95% confidence level
                                if (bestDetection.detection._score >= 0.95) {
                                    clearInterval(detectFaceInterval); // Stop detection

                                    console.log('Face detected with high confidence:', bestDetection.detection._score);

                                    const faceDescriptorArray = Array.from(bestDetection.descriptor);
                                    console.log('Face Descriptor Array:', faceDescriptorArray);

                                    // Calculate size of the descriptor
                                    const sizeInKB = (faceDescriptorArray.length * 4) / 1024;
                                    console.log(`Descriptor size: ${sizeInKB.toFixed(2)} KB`);

                                    // Store face descriptor in Chrome storage
                                    chrome.storage.sync.set({ faceDescriptorArray }, () => {
                                        if (chrome.runtime.lastError) {
                                            console.error('Error storing descriptor:', chrome.runtime.lastError);
                                        } else {
                                            console.log('Descriptor stored successfully.');
                                            alert('Face captured successfully!');
                                            // Stop the camera and close the window
                                            stream.getTracks().forEach((track) => track.stop());
                                            window.close();
                                        }
                                    });
                                    
                                }
                            } else {
                                // Clear the canvas if no face is detected
                                context.clearRect(0, 0, canvas.width, canvas.height);
                                console.log('No face detected.');
                            }
                        })
                        .catch((err) => console.error('Error during face detection:', err));
                }, 100); // Check for faces every 100ms
            };
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
            alert('Could not access the camera. Please check permissions or try a different browser.');
        });
}

function loadModels() {
    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    ])
        .then(() => {
            console.log('FaceAPI models loaded successfully.');
            startCamera();
        })
        .catch((error) => {
            console.error('Error loading FaceAPI models:', error);
            alert('Failed to load face detection models. Please try again later.');
        });
}

// Load models and start the camera
loadModels();
