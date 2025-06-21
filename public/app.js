document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!fileInput.files.length) {
      alert('Please select a file first');
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      resultDiv.innerHTML = '';
      progressContainer.style.display = 'block';
      progressBar.style.width = '0%';
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          progressBar.style.width = `${percentComplete}%`;
        }
      };

      xhr.onload = () => {
        progressContainer.style.display = 'none';
        
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          
          resultDiv.innerHTML = `
            <div class="success-message">
              <h3>Upload Successful!</h3>
              <p>File Type: ${data.type}</p>
              <p>File Size: ${formatFileSize(data.size)}</p>
              <div class="url-container">
                <input type="text" id="fileUrl" value="${data.url}" readonly>
                <button onclick="copyToClipboard()">Copy</button>
              </div>
              <a href="${data.url}" target="_blank" class="preview-link">Preview File</a>
            </div>
          `;
        } else {
          const error = JSON.parse(xhr.responseText).error || 'Upload failed';
          resultDiv.innerHTML = `<div class="error-message">${error}</div>`;
        }
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload failed:', error);
      resultDiv.innerHTML = '<div class="error-message">Upload failed. Please try again.</div>';
      progressContainer.style.display = 'none';
    }
  });
});

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function copyToClipboard() {
  const copyText = document.getElementById('fileUrl');
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('URL copied to clipboard!');
}