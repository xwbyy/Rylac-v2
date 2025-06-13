document.addEventListener('DOMContentLoaded', function() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const uploadArea = document.getElementById('uploadArea');
  const resultDiv = document.getElementById('result');
  const loadingDiv = document.getElementById('loading');
  const fileLink = document.getElementById('fileLink');
  const copyBtn = document.getElementById('copyBtn');
  const newUpload = document.getElementById('newUpload');

  // Handle file selection via button
  selectFileBtn.addEventListener('click', () => fileInput.click());
  
  // Handle file selection via input
  fileInput.addEventListener('change', handleFiles);
  
  // Handle drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropZone.classList.add('highlight');
  }
  
  function unhighlight() {
    dropZone.classList.remove('highlight');
  }
  
  dropZone.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
  }
  
  function handleFiles(e) {
    const files = e.target.files;
    if (files.length === 0) return;
    
    uploadFile(files[0]);
  }
  
  function uploadFile(file) {
    // Show loading state
    uploadArea.style.display = 'none';
    loadingDiv.style.display = 'block';
    resultDiv.style.display = 'none';
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.url) {
        // Show result
        fileLink.value = data.url;
        loadingDiv.style.display = 'none';
        resultDiv.style.display = 'block';
      } else {
        throw new Error('No URL returned');
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      loadingDiv.style.display = 'none';
      uploadArea.style.display = 'block';
      alert('Error uploading file. Please try again.');
    });
  }
  
  // Copy link to clipboard
  copyBtn.addEventListener('click', () => {
    fileLink.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });
  
  // New upload
  newUpload.addEventListener('click', (e) => {
    e.preventDefault();
    resultDiv.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
  });
});