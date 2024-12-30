document.addEventListener("DOMContentLoaded", () => {
  const openCameraButton = document.getElementById("open-camera");

  if (openCameraButton) {
    openCameraButton.addEventListener("click", (event) => {
      event.preventDefault();

      // Open camera.html in a popup window
      const cameraWindow = window.open('camera.html', 'Camera', 'width=800,height=600');

      if (!cameraWindow) {
        console.error('Failed to open the camera window.');
        return;
      }

      // Listen for messages from the child window
     
    });
  }
});
