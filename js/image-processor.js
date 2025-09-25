// Image processing functions

// Apply color adjustments
function applyColorAdjustments(data, brightnessVal, contrastVal, saturationVal) {
    const contrastFactor = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));
    
    for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = clamp(data[i] + brightnessVal, 0, 255);
        data[i + 1] = clamp(data[i + 1] + brightnessVal, 0, 255);
        data[i + 2] = clamp(data[i + 2] + brightnessVal, 0, 255);
        
        // Contrast
        data[i] = clamp(contrastFactor * (data[i] - 128) + 128, 0, 255);
        data[i + 1] = clamp(contrastFactor * (data[i + 1] - 128) + 128, 0, 255);
        data[i + 2] = clamp(contrastFactor * (data[i + 2] - 128) + 128, 0, 255);
        
        // Saturation
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        const satFactor = 1 + (saturationVal / 100);
        data[i] = clamp(gray + satFactor * (data[i] - gray), 0, 255);
        data[i + 1] = clamp(gray + satFactor * (data[i + 1] - gray), 0, 255);
        data[i + 2] = clamp(gray + satFactor * (data[i + 2] - gray), 0, 255);
    }
}

// Color palettes
function getSelectedPalette(name, colorCount) {
    const palettes = {
        standard: [
            [0, 0, 0], [0, 0, 168], [0, 168, 0], [0, 168, 168],
            [168, 0, 0], [168, 0, 168], [168, 84, 0], [168, 168, 168],
            [84, 84, 84], [84, 84, 252], [84, 252, 84], [84, 252, 252],
            [252, 84, 84], [252, 84, 252], [252, 252, 84], [252, 252, 252]
        ],
        pastel: [
            [255, 209, 220], [255, 223, 184], [255, 248, 184], [208, 255, 184],
            [184, 255, 240], [184, 224, 255], [216, 184, 255], [255, 184, 252]
        ],
        vibrant: [
            [230, 0, 0], [255, 100, 0], [255, 200, 0], [0, 180, 0],
            [0, 200, 200], [0, 100, 230], [100, 0, 230], [200, 0, 200]
        ],
        monochrome: [
            [0, 0, 0], [40, 40, 40], [80, 80, 80], [120, 120, 120],
            [160, 160, 160], [200, 200, 200], [240, 240, 240], [255, 255, 255]
        ],
        sepia: [
            [20, 10, 0], [60, 40, 20], [100, 80, 60], [140, 120, 100],
            [180, 160, 140], [220, 200, 180], [245, 230, 210], [255, 250, 245]
        ],
        neon: [
            [57, 255, 20], [0, 255, 255], [255, 20, 147], [255, 255, 0],
            [0, 0, 255], [255, 0, 255], [0, 255, 127], [255, 69, 0]
        ],
        earth: [
            [102, 51, 0], [153, 102, 51], [204, 153, 102], [153, 153, 102],
            [102, 153, 102], [51, 102, 51], [153, 204, 153], [235, 216, 189]
        ],
        grayscale: [
            [0, 0, 0], [32, 32, 32], [64, 64, 64], [96, 96, 96],
            [128, 128, 128], [160, 160, 160], [192, 192, 192], [224, 224, 224], [255, 255, 255]
        ],
        retro: [
            [0, 0, 0], [85, 85, 85], [170, 170, 170], [255, 255, 255],
            [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0],
            [255, 0, 255], [0, 255, 255]
        ]
    };

    if (name === 'original' && originalImageData) {
        return generatePaletteFromImage(originalImageData.data, colorCount);
    }
    
    const palette = palettes[name] || palettes.standard;
    if (colorCount <= palette.length) {
        return palette.slice(0, colorCount);
    }
    
    // Extend palette if needed
    const extendedPalette = [];
    for (let i = 0; i < colorCount; i++) {
        extendedPalette.push(palette[i % palette.length]);
    }
    return extendedPalette;
}

function generatePaletteFromImage(imageData, colorCount) {
    const palette = [];
    const pixels = imageData;
    const totalPixels = pixels.length / 4;
    const step = Math.max(1, Math.floor(totalPixels / colorCount));
    
    for (let i = 0; i < pixels.length && palette.length < colorCount; i += step * 4) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
        const isDuplicate = palette.some(color => 
            Math.abs(color[0] - r) < 12 && 
            Math.abs(color[1] - g) < 12 && 
            Math.abs(color[2] - b) < 12
        );
        
        if (!isDuplicate) {
            palette.push([r, g, b]);
        }
    }
    
    // Fill remaining colors if needed
    while (palette.length < colorCount) {
        palette.push([
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ]);
    }
    
    return palette;
}

function findClosestColor(r, g, b, palette) {
    let closestColor = palette[0];
    let smallestDistance = Infinity;
    
    for (let i = 0; i < palette.length; i++) {
        const color = palette[i];
        const distance = Math.pow(r - color[0], 2) + 
                        Math.pow(g - color[1], 2) + 
                        Math.pow(b - color[2], 2);
        
        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = color;
        }
    }
    
    return closestColor;
}

// Dithering matrix
const ditherMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

function getDitherValue(x, y) {
    return (ditherMatrix[y % 4][x % 4] / 16) - 0.5;
}

// Main conversion function
function convertToPixelArt() {
    if (!originalImage) {
        showNotification('Please load an image first.', 'error');
        return;
    }

    const outputWidth = parseInt(resolution.value);
    const colorCount = parseInt(colorReduction.value);
    const ditherAmount = parseInt(ditherIntensity.value) / 100;
    const brightnessVal = parseInt(brightness.value);
    const contrastVal = parseInt(contrast.value);
    const saturationVal = parseInt(saturation.value);
    const paletteName = paletteSelector.value;

    // Calculate output height maintaining aspect ratio
    const aspectRatio = originalImage.height / originalImage.width;
    const outputHeight = Math.max(1, Math.floor(outputWidth * aspectRatio));

    // Set canvas size
    resultCanvas.width = outputWidth;
    resultCanvas.height = outputHeight;

    const context = resultCanvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, outputWidth, outputHeight);
    context.drawImage(originalImage, 0, 0, outputWidth, outputHeight);

    // Get pixel data
    let imageData = context.getImageData(0, 0, outputWidth, outputHeight);
    let pixels = imageData.data;

    // Apply color adjustments
    applyColorAdjustments(pixels, brightnessVal, contrastVal, saturationVal);

    // Get selected palette
    const palette = getSelectedPalette(paletteName, colorCount);

    // Apply dithering and color reduction
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
            const index = (y * outputWidth + x) * 4;
            
            const ditherOffset = getDitherValue(x, y) * (ditherAmount * 64);
            const r = clamp(Math.round(pixels[index] + ditherOffset), 0, 255);
            const g = clamp(Math.round(pixels[index + 1] + ditherOffset), 0, 255);
            const b = clamp(Math.round(pixels[index + 2] + ditherOffset), 0, 255);
            
            const newColor = findClosestColor(r, g, b, palette);
            pixels[index] = newColor[0];
            pixels[index + 1] = newColor[1];
            pixels[index + 2] = newColor[2];
        }
    }

    context.putImageData(imageData, 0, 0);
    convertedImageDataURL = resultCanvas.toDataURL('image/png');

    // Update display
    sceneContainer.style.display = 'none';
    resultCanvas.style.display = 'block';
    fitCanvasToWrapper();

    if (isSceneMode) {
        createSceneComposition();
    }
    
    showNotification('Image converted successfully!', 'info');
}

function fitCanvasToWrapper() {
    const wrapper = resultWrapper.getBoundingClientRect();
    const canvasWidth = resultCanvas.width;
    const canvasHeight = resultCanvas.height;
    
    if (canvasWidth === 0 || canvasHeight === 0) return;
    
    const scale = Math.min(wrapper.width / canvasWidth, wrapper.height / canvasHeight);
    const displayWidth = Math.round(canvasWidth * scale);
    const displayHeight = Math.round(canvasHeight * scale);
    
    resultCanvas.style.width = displayWidth + 'px';
    resultCanvas.style.height = displayHeight + 'px';
}

function createSceneComposition() {
    if (!convertedImageDataURL) return;
    
    resultCanvas.style.display = 'none';
    sceneContainer.style.display = 'block';
    sceneImage.src = convertedImageDataURL;
    sceneTextDisplay.textContent = dialogText.value || 'Enter your text here...';
    sceneTextDisplay.style.fontSize = textSize.value + 'px';

    const baseWidth = imagePreview.clientWidth || resultWrapper.clientWidth;
    const scale = parseInt(imageSize.value) / 100;
    const displayWidth = Math.max(16, Math.round(baseWidth * scale));
    const aspectRatio = resultCanvas.height / Math.max(1, resultCanvas.width);
    const displayHeight = Math.round(displayWidth * aspectRatio);
    
    sceneImage.style.width = displayWidth + 'px';
    sceneImage.style.height = displayHeight + 'px';
}

function downloadImage() {
    if (isSceneMode) {
        downloadSceneComposition();
    } else {
        downloadConvertedImage();
    }
}

function downloadConvertedImage() {
    const link = document.createElement('a');
    link.download = 'pixel-art-image.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
    showNotification('Image downloaded!', 'info');
}

function downloadSceneComposition() {
    const sceneCanvas = document.createElement('canvas');
    const outputWidth = parseInt(sceneDownloadResolution.value);
    const outputHeight = Math.round(outputWidth * 0.75);
    
    sceneCanvas.width = outputWidth;
    sceneCanvas.height = outputHeight;
    
    const context = sceneCanvas.getContext('2d');
    context.fillStyle = '#000';
    context.fillRect(0, 0, outputWidth, outputHeight);

    const image = new Image();
    image.onload = function() {
        const scale = parseInt(imageSize.value) / 100;
        const drawWidth = Math.max(8, Math.round(outputWidth * 0.6 * scale));
        const aspectRatio = image.height / image.width;
        const drawHeight = Math.round(drawWidth * aspectRatio);
        const x = Math.round((outputWidth - drawWidth) / 2);
        const y = 30;
        
        context.imageSmoothingEnabled = false;
        context.drawImage(image, x, y, drawWidth, drawHeight);

        const fontSize = Math.max(12, parseInt(textSize.value) * (outputWidth / 1024));
        context.font = `${fontSize}px 'Segoe UI', sans-serif`;
        context.fillStyle = '#fff';
        context.textAlign = 'center';
        
        const text = dialogText.value || '';
        wrapText(context, text, outputWidth / 2, outputHeight - 60, outputWidth - 80, fontSize + 8);
        
        const link = document.createElement('a');
        link.download = 'pixel-art-scene.png';
        link.href = sceneCanvas.toDataURL('image/png');
        link.click();
        showNotification('Scene composition downloaded!', 'info');
    };
    
    image.onerror = function() {
        showNotification('Error downloading scene.', 'error');
    };
    
    image.src = convertedImageDataURL;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
}