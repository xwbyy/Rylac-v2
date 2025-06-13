document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const uploadContainer = document.getElementById('uploadContainer');
  const resultContainer = document.getElementById('resultContainer');
  const loadingContainer = document.getElementById('loadingContainer');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const fileLink = document.getElementById('fileLink');
  const copyBtn = document.getElementById('copyBtn');
  const newUploadBtn = document.getElementById('newUploadBtn');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadProgressBar = document.getElementById('uploadProgressBar');
  const shareWhatsApp = document.getElementById('shareWhatsApp');
  const shareTelegram = document.getElementById('shareTelegram');
  const shareEmail = document.getElementById('shareEmail');
  const fileInfo = document.getElementById('fileInfo');

  // Initialize app
  initApp();

  function initApp() {
    setupEventListeners();
    checkForSharedFile();
  }

  function setupEventListeners() {
    // File selection via button
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    // File selection via input
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlightDropZone, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlightDropZone, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Copy link button
    copyBtn.addEventListener('click', copyToClipboard);
    
    // New upload button
    newUploadBtn.addEventListener('click', resetUploader);
    
    // Share buttons
    shareWhatsApp.addEventListener('click', () => shareLink('whatsapp'));
    shareTelegram.addEventListener('click', () => shareLink('telegram'));
    shareEmail.addEventListener('click', () => shareLink('email'));
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlightDropZone() {
    dropZone.classList.add('highlight');
  }

  function unhighlightDropZone() {
    dropZone.classList.remove('highlight');
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }

  function handleFiles(files) {
    const file = files[0];
    
    // Validate file size (client-side validation)
    if (file.size > 100 * 1024 * 1024) {
      showError('File size exceeds 100MB limit');
      return;
    }
    
    // Display file info
    displayFileInfo(file);
    
    // Show upload button
    selectFileBtn.textContent = 'Upload File';
    selectFileBtn.addEventListener('click', () => uploadFile(file), { once: true });
  }

  function displayFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Create preview based on file type
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    } else {
      const fileType = file.name.split('.').pop().toUpperCase();
      filePreview.innerHTML = `<div class="file-icon">${fileType}</div>`;
    }
    
    fileInfo.style.display = 'flex';
  }

  function uploadFile(file) {
    // Show loading state
    uploadContainer.style.display = 'none';
    loadingContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    
    // Simulate progress (real progress would need XHR with progress events)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) progress = 90;
      updateProgress(progress, 'Uploading file...');
    }, 300);
    
    const formData = new FormData();
    formData.append('file', file);
    
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      clearInterval(progressInterval);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      updateProgress(100, 'Processing complete!');
      
      if (data.success && data.url) {
        setTimeout(() => {
          showResult(data.url, file.name);
        }, 500);
      } else {
        throw new Error(data.error || 'No URL returned');
      }
    })
    .catch(error => {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      showError(error.message || 'Failed to upload file');
    });
  }

  function updateProgress(percent, message) {
    uploadProgress.textContent = message;
    uploadProgressBar.style.width = `${percent}%`;
  }

  function showResult(url, filename) {
    loadingContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    fileLink.value = url;
    
    // Update share buttons with the new link
    shareWhatsApp.dataset.url = url;
    shareTelegram.dataset.url = url;
    shareEmail.dataset.url = url;
  }

  function showError(message) {
    loadingContainer.style.display = 'none';
    uploadContainer.style.display = 'block';
    
    // Create and show error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    
    dropZone.appendChild(errorElement);
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  function copyToClipboard() {
    fileLink.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  }

  function resetUploader() {
    // Reset form
    fileInput.value = '';
    fileInfo.style.display = 'none';
    filePreview.innerHTML = '';
    
    // Reset buttons
    selectFileBtn.innerHTML = '<i class="fas fa-folder-open"></i> Choose Files';
    selectFileBtn.removeEventListener('click', uploadFile);
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    // Show upload container
    resultContainer.style.display = 'none';
    uploadContainer.style.display = 'block';
  }

  function shareLink(platform) {
    const url = encodeURIComponent(fileLink.value);
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Check out this file: ${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?body=Check out this file: ${url}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function checkForSharedFile() {
    // Check URL for file parameter (could be used for future features)
    const params = new URLSearchParams(window.location.search);
    if (params.has('file')) {
      // Potential feature: load shared file info
    }
  }
});