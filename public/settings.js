// Settings management
const settingsKey = 'rylacToolsSettings';

// Initialize settings
function initSettings() {
    // Set default settings if none exist
    if (!localStorage.getItem(settingsKey)) {
        const defaultSettings = {
            theme: 'system',
            language: 'en',
            downloadQuality: 'best',
            downloadLocation: 'direct'
        };
        localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
    }
    
    // Apply theme
    applyTheme();
    
    // Theme preference change
    document.getElementById('theme-preference').addEventListener('change', function() {
        setSetting('theme', this.value);
        applyTheme();
    });
    
    // Download quality change
    document.getElementById('download-quality').addEventListener('change', function() {
        setSetting('downloadQuality', this.value);
    });
    
    // Download location change
    document.getElementById('download-location').addEventListener('change', function() {
        setSetting('downloadLocation', this.value);
    });
    
    // Load current settings into UI
    loadSettings();
}

// Load settings into UI
function loadSettings() {
    const settings = getSettings();
    
    // Theme
    document.getElementById('theme-preference').value = settings.theme || 'system';
    
    // Download quality
    document.getElementById('download-quality').value = settings.downloadQuality || 'best';
    
    // Download location
    document.getElementById('download-location').value = settings.downloadLocation || 'direct';
}

// Get all settings
function getSettings() {
    return JSON.parse(localStorage.getItem(settingsKey)) || {};
}

// Get a specific setting
function getSetting(key) {
    const settings = getSettings();
    return settings[key];
}

// Set a specific setting
function setSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

// Apply theme based on settings
function applyTheme() {
    const theme = getSetting('theme') || 'system';
    
    if (theme === 'system') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Update theme toggle icon
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeToggle = document.getElementById('theme-toggle');
    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Initialize theme toggle
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (getSetting('theme') === 'system') {
            applyTheme();
        }
    });
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setSetting('theme', newTheme);
    applyTheme();
}

// Translations for the app
const translations = {
    en: {
        downloader: 'Downloader',
        results: 'Results',
        history: 'History',
        settings: 'Settings',
        welcome_title: 'Welcome to Rylac Tools',
        welcome_text: 'Download videos, music, and files from various platforms with ease. Simply paste a URL or search for content.',
        no_results: 'No results yet',
        search_prompt: 'Enter a URL or search term to get started.',
        no_history: 'No history yet',
        history_prompt: 'Your download history will appear here.',
        settings_title: 'Settings',
        theme_preference: 'Theme Preference',
        system_default: 'System Default',
        light_mode: 'Light Mode',
        dark_mode: 'Dark Mode',
        download_quality: 'Default Download Quality',
        best_quality: 'Best Quality',
        '1080p': '1080p',
        '720p': '720p',
        '480p': '480p',
        download_location: 'Download Location',
        direct_download: 'Direct Download',
        preview_first: 'Preview First',
        clear_history: 'Clear History',
        clear_history_button: 'Clear All History',
        about_title: 'About Rylac Tools',
        about_text: 'Rylac Tools is a multi-functional web tool that allows you to download content from various platforms. Version 1.0.0',
        enter_url_or_search: 'Please enter a URL or search term',
        selected_service: 'Selected service',
        service_not_supported: 'Service not supported',
        api_error: 'API Error',
        no_results_found: 'No results found',
        available_qualities: 'Available Qualities',
        download: 'Download',
        preview: 'Preview',
        download_started: 'Download started',
        close_preview: 'Close Preview',
        history_item_deleted: 'History item deleted',
        confirm_clear_history: 'Are you sure you want to clear all history?',
        history_cleared: 'History cleared',
        processing: 'Processing...'
    },
    id: {
        downloader: 'Pengunduh',
        results: 'Hasil',
        history: 'Riwayat',
        settings: 'Pengaturan',
        welcome_title: 'Selamat Datang di Rylac Tools',
        welcome_text: 'Unduh video, musik, dan file dari berbagai platform dengan mudah. Cukup tempel URL atau cari konten.',
        no_results: 'Belum ada hasil',
        search_prompt: 'Masukkan URL atau istilah pencarian untuk memulai.',
        no_history: 'Belum ada riwayat',
        history_prompt: 'Riwayat unduhan Anda akan muncul di sini.',
        settings_title: 'Pengaturan',
        theme_preference: 'Preferensi Tema',
        system_default: 'Default Sistem',
        light_mode: 'Mode Terang',
        dark_mode: 'Mode Gelap',
        download_quality: 'Kualitas Unduhan Default',
        best_quality: 'Kualitas Terbaik',
        '1080p': '1080p',
        '720p': '720p',
        '480p': '480p',
        download_location: 'Lokasi Unduhan',
        direct_download: 'Unduh Langsung',
        preview_first: 'Pratinjau Dulu',
        clear_history: 'Hapus Riwayat',
        clear_history_button: 'Hapus Semua Riwayat',
        about_title: 'Tentang Rylac Tools',
        about_text: 'Rylac Tools adalah alat web multi-fungsi yang memungkinkan Anda mengunduh konten dari berbagai platform. Versi 1.0.0',
        enter_url_or_search: 'Silakan masukkan URL atau istilah pencarian',
        selected_service: 'Layanan yang dipilih',
        service_not_supported: 'Layanan tidak didukung',
        api_error: 'Kesalahan API',
        no_results_found: 'Tidak ada hasil ditemukan',
        available_qualities: 'Kualitas Tersedia',
        download: 'Unduh',
        preview: 'Pratinjau',
        download_started: 'Unduhan dimulai',
        close_preview: 'Tutup Pratinjau',
        history_item_deleted: 'Item riwayat dihapus',
        confirm_clear_history: 'Apakah Anda yakin ingin menghapus semua riwayat?',
        history_cleared: 'Riwayat dihapus',
        processing: 'Memproses...'
    }
};