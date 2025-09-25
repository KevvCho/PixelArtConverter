// Main application initialization and global variables
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pixel Art Converter initialized');
    
    // Initialize DOM references
    initializeDOMReferences();
    
    // Initialize all value displays
    initializeValueDisplays();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set placeholder text
    imagePreview.alt = 'Click to load image';
});

// Global variables
let originalImage = null;
let originalImageData = null;
let convertedImageDataURL = null;
let isSceneMode = false;

// DOM elements references
let sidebar, menuBtn, fileInput, imagePreview, originalArea;
let resultCanvas, resultWrapper, sceneContainer, sceneImage, sceneTextDisplay;
let resolution, resolutionValue, colorReduction, colorValue, ditherIntensity, ditherValue;
let brightness, brightnessValue, contrast, contrastValue, saturation, saturationValue;
let paletteSelector, createScene, sceneControls, dialogText, imageSize, imageSizeValue;
let textSize, textSizeValue, sceneDownloadResolution, sceneDownloadResolutionValue;
let convertBtn, downloadBtn;

function initializeDOMReferences() {
    // Sidebar and menu
    sidebar = document.getElementById('sidebar');
    menuBtn = document.getElementById('menuBtn');
    
    // File handling
    fileInput = document.getElementById('file-input');
    imagePreview = document.getElementById('image-preview');
    originalArea = document.getElementById('original-area');
    
    // Result area
    resultCanvas = document.getElementById('result');
    resultWrapper = document.getElementById('result-wrapper');
    sceneContainer = document.getElementById('scene-container');
    sceneImage = document.getElementById('scene-image');
    sceneTextDisplay = document.getElementById('scene-text-display');
    
    // Controls
    resolution = document.getElementById('resolution');
    resolutionValue = document.getElementById('resolution-value');
    colorReduction = document.getElementById('color-reduction');
    colorValue = document.getElementById('color-value');
    ditherIntensity = document.getElementById('dither-intensity');
    ditherValue = document.getElementById('dither-value');
    brightness = document.getElementById('brightness');
    brightnessValue = document.getElementById('brightness-value');
    contrast = document.getElementById('contrast');
    contrastValue = document.getElementById('contrast-value');
    saturation = document.getElementById('saturation');
    saturationValue = document.getElementById('saturation-value');
    paletteSelector = document.getElementById('palette-selector');
    createScene = document.getElementById('create-scene');
    sceneControls = document.getElementById('scene-controls');
    dialogText = document.getElementById('scene-text');
    imageSize = document.getElementById('image-size');
    imageSizeValue = document.getElementById('image-size-value');
    textSize = document.getElementById('text-size');
    textSizeValue = document.getElementById('text-size-value');
    sceneDownloadResolution = document.getElementById('scene-download-resolution');
    sceneDownloadResolutionValue = document.getElementById('scene-download-resolution-value');
    convertBtn = document.getElementById('convert-btn');
    downloadBtn = document.getElementById('download-btn');
}

function initializeValueDisplays() {
    updateValueDisplay('resolution-value', resolution.value);
    updateValueDisplay('color-value', colorReduction.value);
    updateValueDisplay('dither-value', ditherIntensity.value);
    updateValueDisplay('brightness-value', brightness.value);
    updateValueDisplay('contrast-value', contrast.value);
    updateValueDisplay('saturation-value', saturation.value);
    updateValueDisplay('image-size-value', imageSize.value);
    updateValueDisplay('text-size-value', textSize.value);
    updateValueDisplay('scene-download-resolution-value', sceneDownloadResolution.value);
}

function setupEventListeners() {
    // Menu toggle
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    
    // File handling
    imagePreview.addEventListener('click', () => fileInput.click());
    
    originalArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        originalArea.style.background = 'rgba(255, 255, 255, 0.05)';
    });
    
    originalArea.addEventListener('dragleave', () => {
        originalArea.style.background = '';
    });
    
    originalArea.addEventListener('drop', (e) => {
        e.preventDefault();
        originalArea.style.background = '';
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Slider value updates
    resolution.addEventListener('input', () => updateValueDisplay('resolution-value', resolution.value));
    colorReduction.addEventListener('input', () => updateValueDisplay('color-value', colorReduction.value));
    ditherIntensity.addEventListener('input', () => updateValueDisplay('dither-value', ditherIntensity.value));
    brightness.addEventListener('input', () => updateValueDisplay('brightness-value', brightness.value));
    contrast.addEventListener('input', () => updateValueDisplay('contrast-value', contrast.value));
    saturation.addEventListener('input', () => updateValueDisplay('saturation-value', saturation.value));
    sceneDownloadResolution.addEventListener('input', () => updateValueDisplay('scene-download-resolution-value', sceneDownloadResolution.value));
    
    // Scene controls
    dialogText.addEventListener('input', () => {
        sceneTextDisplay.textContent = dialogText.value || 'Enter your text here...';
    });
    
    imageSize.addEventListener('input', () => {
        updateValueDisplay('image-size-value', imageSize.value);
        if (isSceneMode && convertedImageDataURL) {
            createSceneComposition();
        }
    });
    
    textSize.addEventListener('input', () => {
        updateValueDisplay('text-size-value', textSize.value);
        sceneTextDisplay.style.fontSize = textSize.value + 'px';
    });
    
    createScene.addEventListener('change', () => {
        isSceneMode = createScene.checked;
        sceneControls.style.display = isSceneMode ? 'block' : 'none';
        
        if (isSceneMode && convertedImageDataURL) {
            createSceneComposition();
        } else {
            sceneContainer.style.display = 'none';
            resultCanvas.style.display = 'block';
            fitCanvasToWrapper();
        }
    });
    
    // Button events
    convertBtn.addEventListener('click', convertToPixelArt);
    downloadBtn.addEventListener('click', downloadImage);
    
    // Window resize handling
    window.addEventListener('resize', () => {
        if (resultCanvas && resultCanvas.width) {
            fitCanvasToWrapper();
        }
        if (isSceneMode && convertedImageDataURL) {
            createSceneComposition();
        }
    });
}

// Helper function to update value displays
function updateValueDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Utility function to limit values between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Simple file validation
function isValidImageFile(file) {
    return file && file.type.startsWith('image/');
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f72585' : '#4361ee'};
        color: white;
        border-radius: 6px;
        z-index: 2000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// File handling function
function handleFile(file) {
    if (!isValidImageFile(file)) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            imagePreview.src = img.src;
            
            // Store original image data for palette generation
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempContext = tempCanvas.getContext('2d');
            tempContext.drawImage(img, 0, 0);
            
            try {
                originalImageData = tempContext.getImageData(0, 0, img.width, img.height);
            } catch (error) {
                console.warn('Could not access image data:', error);
                originalImageData = null;
            }
            
            // Suggest resolution based on image width
            const suggestedResolution = Math.min(480, img.width);
            resolution.value = suggestedResolution;
            updateValueDisplay('resolution-value', suggestedResolution);
            
            showNotification('Image loaded successfully!', 'info');
        };
        
        img.onerror = function() {
            showNotification('Error loading image.', 'error');
        };
        
        img.src = ev.target.result;
    };
    
    reader.onerror = function() {
        showNotification('Error reading file.', 'error');
    };
    
    reader.readAsDataURL(file);
}