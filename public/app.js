document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!fileInput.files.length) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
      resultDiv.innerHTML = '<p>Uploading file, please wait...</p>';
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      resultDiv.innerHTML = `
        <h3>Upload Successful!</h3>
        <p>Your file is available at:</p>
        <p><a href="${data.yourDomainUrl}" target="_blank">${data.yourDomainUrl}</a></p>
        <p>Original URL: <a href="${data.directUrl}" target="_blank">${data.directUrl}</a></p>
      `;
    } catch (error) {
      console.error('Upload failed:', error);
      resultDiv.innerHTML = '<p>Upload failed. Please try again.</p>';
    }
  });
});