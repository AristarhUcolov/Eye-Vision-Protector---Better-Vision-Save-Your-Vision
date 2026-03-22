// Content script - injected on all pages
let stylesApplied = false;
let currentTheme = 'light';
let magnifierElement = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentZoom = 24;
let readingRulerElement = null;
let readingRulerEnabled = false;
let extensionDisabled = false;

// Wait for DOM to be ready before appending elements
function onDomReady(fn) {
  if (document.body) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// Check if site is disabled before doing anything
chrome.storage.sync.get(['disabledSites', 'extensionEnabled'], (data) => {
  // Check master toggle
  if (data.extensionEnabled === false) {
    extensionDisabled = true;
    return;
  }

  // Check disabled sites list
  const sites = data.disabledSites || [];
  const hostname = window.location.hostname;

  for (const site of sites) {
    if (hostname === site || hostname.endsWith('.' + site) || hostname.includes(site)) {
      extensionDisabled = true;
      return;
    }
  }

  // Site is enabled - apply styles
  applyStyles();
  onDomReady(initDomElements);
});

// Initialize DOM-dependent elements (SVG filters, magnifier styles)
function initDomElements() {
  // Add SVG filters for color blindness
  const svgFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgFilters.setAttribute('class', 'vision-helper-svg-filter');
  svgFilters.style.cssText = 'position:absolute;width:0;height:0;';
  svgFilters.innerHTML = `
    <defs>
      <filter id="protanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="deuteranopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="tritanopia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
      </filter>
      <filter id="achromatopsia" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0"/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svgFilters);

  // Add magnifier styles
  const magnifierStyles = document.createElement('style');
  magnifierStyles.id = 'vision-helper-magnifier-styles';
  magnifierStyles.textContent = `
    .vision-helper-magnifier {
      transition: box-shadow 0.2s ease;
    }
    .magnifier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      cursor: move;
      user-select: none;
    }
    .magnifier-title {
      font-weight: bold;
      font-size: 16px;
    }
    .magnifier-controls {
      display: flex;
      gap: 5px;
    }
    .magnifier-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
      transition: opacity 0.2s;
    }
    .magnifier-btn:hover {
      opacity: 0.8;
    }
    .magnifier-content {
      padding: 8px;
      border-radius: 6px;
    }
  `;
  document.head.appendChild(magnifierStyles);

  // Initialize reading ruler if already enabled
  chrome.storage.sync.get(['readingRuler'], (data) => {
    if (data.readingRuler) {
      toggleReadingRuler(true);
    }
  });

  // Apply custom CSS if exists
  chrome.storage.sync.get(['customCSS'], (data) => {
    if (data.customCSS) {
      applyCustomCSS(data.customCSS);
    }
  });
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (extensionDisabled && request.action !== 'enableExtension' && request.action !== 'disableExtension') {
    return;
  }

  switch (request.action) {
    case 'applyStyles':
      applyStyles(request.data);
      break;
    case 'applyTheme':
      applyTheme(request.theme);
      updateMagnifierTheme();
      break;
    case 'showMagnifier':
      showMagnifier(request.text);
      break;
    case 'applyCustomCSS':
      applyCustomCSS(request.css);
      break;
    case 'toggleReadingRuler':
      toggleReadingRuler(request.enabled);
      break;
    case 'disableExtension':
      extensionDisabled = true;
      removeAllStyles();
      break;
    case 'enableExtension':
      extensionDisabled = false;
      applyStyles();
      break;
    case 'getCurrentSettings':
      chrome.storage.sync.get([
        'fontSize', 'boldText', 'selectedFont',
        'darkMode', 'currentTheme', 'colorBlindMode'
      ], (data) => {
        sendResponse(data);
      });
      return true;
  }
});

// Remove all extension styles
function removeAllStyles() {
  ['vision-helper-styles', 'vision-helper-theme', 'vision-helper-custom-css'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  if (readingRulerElement) {
    readingRulerElement.style.display = 'none';
  }
  if (magnifierElement) {
    closeMagnifier();
  }
  document.documentElement.classList.remove('dark-theme', 'light-theme');
  document.documentElement.removeAttribute('data-vision-helper-theme');
}

// Apply styles
function applyStyles(settings) {
  if (extensionDisabled) return;

  if (!settings) {
    chrome.storage.sync.get([
      'fontSize', 'boldText', 'selectedFont',
      'currentTheme', 'colorBlindMode', 'blueLightFilter',
      'blueLightIntensity', 'focusMode', 'readingRuler',
      'pageDimmer', 'pageDimmerIntensity', 'highContrast'
    ], (data) => {
      applyStyles(data);
      if (data.readingRuler && !readingRulerEnabled) {
        toggleReadingRuler(true);
      }
    });
    return;
  }

  // Remove previous styles
  const oldStyle = document.getElementById('vision-helper-styles');
  if (oldStyle) oldStyle.remove();

  const styleElement = document.createElement('style');
  styleElement.id = 'vision-helper-styles';

  let css = '';

  // Font settings
  const font = settings.selectedFont || 'Arial';
  const fontSize = settings.fontSize || 0;
  const isBold = settings.boldText;

  if (font !== 'Arial' || fontSize > 0 || isBold) {
    css += `*:not(.vision-helper-magnifier):not(.vision-helper-magnifier *):not(.vision-helper-reading-ruler) {`;
    css += `font-family: ${font}, sans-serif !important;`;
    if (fontSize > 0) {
      css += `font-size: ${16 + fontSize}px !important;`;
      css += `line-height: ${1.2 + fontSize * 0.05} !important;`;
    }
    if (isBold) {
      css += `font-weight: bold !important;`;
    }
    css += `}`;
  }

  // Color blind filter
  if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
    css += getColorBlindFilter(settings.colorBlindMode);
  }

  // Blue light filter
  if (settings.blueLightFilter) {
    const intensity = settings.blueLightIntensity || 50;
    const orangeTint = Math.floor(255 * (intensity / 100));
    css += `
      html::before {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(255, ${255 - orangeTint}, 0, ${intensity / 200});
        pointer-events: none;
        z-index: 2147483646;
        mix-blend-mode: multiply;
      }
    `;
  }

  // Focus mode
  if (settings.focusMode) {
    css += `
      body *:not(.vision-helper-magnifier):not(.vision-helper-reading-ruler) {
        transition: opacity 0.3s ease, filter 0.3s ease;
      }
      body *:not(:hover):not(:focus):not(:focus-within):not(.vision-helper-magnifier):not(.vision-helper-reading-ruler) {
        opacity: 0.7;
        filter: blur(0.5px);
      }
      body *:hover, body *:focus, body *:focus-within {
        opacity: 1 !important;
        filter: none !important;
      }
    `;
  }

  // Page dimmer
  if (settings.pageDimmer) {
    const intensity = settings.pageDimmerIntensity || 30;
    css += `
      html::after {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, ${intensity / 100});
        pointer-events: none;
        z-index: 2147483645;
      }
    `;
  }

  // High contrast
  if (settings.highContrast) {
    css += `
      * { text-shadow: none !important; box-shadow: none !important; }
      body { background: white !important; color: black !important; }
      a { color: #0000EE !important; text-decoration: underline !important; }
      a:visited { color: #551A8B !important; }
      button, input, select, textarea {
        border: 2px solid black !important;
        background: white !important;
        color: black !important;
      }
    `;
  }

  styleElement.textContent = css;

  // Safely append to head
  if (document.head) {
    document.head.appendChild(styleElement);
  } else {
    document.documentElement.appendChild(styleElement);
  }
  stylesApplied = true;

  // Apply theme
  applyTheme(settings.currentTheme || 'light');
}

// Apply custom CSS
function applyCustomCSS(css) {
  let customStyle = document.getElementById('vision-helper-custom-css');
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'vision-helper-custom-css';
    (document.head || document.documentElement).appendChild(customStyle);
  }
  customStyle.textContent = css || '';
}

// Apply theme (light/dark)
function applyTheme(theme) {
  currentTheme = theme;

  // Remove old theme style completely to avoid stale filter state
  const oldStyle = document.getElementById('vision-helper-theme');
  if (oldStyle) oldStyle.remove();

  if (theme === 'dark') {
    chrome.storage.sync.get(['darkModeIntensity'], (data) => {
      const intensity = data.darkModeIntensity || 85;

      // Force clear any inline filter first, then apply via rAF
      document.documentElement.style.filter = 'none';

      requestAnimationFrame(() => {
        document.documentElement.style.removeProperty('filter');

        const styleElement = document.createElement('style');
        styleElement.id = 'vision-helper-theme';
        styleElement.textContent = `
          html {
            filter: invert(${intensity}%) hue-rotate(180deg) !important;
          }
          img:not(.vision-helper-magnifier *),
          picture, video, canvas, iframe,
          [style*="background-image"],
          .vision-helper-magnifier {
            filter: invert(${intensity}%) hue-rotate(180deg) !important;
          }
        `;

        (document.head || document.documentElement).appendChild(styleElement);
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
        document.documentElement.setAttribute('data-vision-helper-theme', 'dark');
        updateMagnifierTheme();
      });
    });
  } else {
    // Light theme: explicitly remove invert filter
    const styleElement = document.createElement('style');
    styleElement.id = 'vision-helper-theme';
    styleElement.textContent = `
      html {
        filter: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(styleElement);

    // Also clear any inline filter that might linger
    document.documentElement.style.removeProperty('filter');

    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-vision-helper-theme', 'light');
    updateMagnifierTheme();
  }
}

// Color blind filters
function getColorBlindFilter(type) {
  const filters = {
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)',
    achromatopsia: 'url(#achromatopsia)'
  };

  return `
    html { filter: ${filters[type] || 'none'}; }
    .vision-helper-magnifier { filter: none !important; }
  `;
}

// ==================== MAGNIFIER ====================

function showMagnifier(text) {
  if (!text || !document.body) return;

  if (magnifierElement) {
    const content = magnifierElement.querySelector('.magnifier-content');
    if (content) {
      content.textContent = text;
      content.style.fontSize = `${currentZoom}px`;
    }
    return;
  }

  magnifierElement = document.createElement('div');
  magnifierElement.className = 'vision-helper-magnifier';
  magnifierElement.style.cssText = `
    position: fixed; z-index: 2147483647;
    top: 20px; right: 20px; width: 320px;
    padding: 16px; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  updateMagnifierTheme();

  magnifierElement.innerHTML = `
    <div class="magnifier-header">
      <div class="magnifier-title">Magnifier</div>
      <div class="magnifier-controls">
        <button class="magnifier-btn magnifier-zoom-in" title="Zoom in">+</button>
        <button class="magnifier-btn magnifier-zoom-out" title="Zoom out">-</button>
        <button class="magnifier-btn magnifier-close" title="Close">&times;</button>
      </div>
    </div>
    <div class="magnifier-content" style="
      max-height: 300px; overflow-y: auto;
      font-size: ${currentZoom}px; line-height: 1.6;
      word-wrap: break-word;
    ">${escapeHtml(text)}</div>
  `;

  magnifierElement.querySelector('.magnifier-close').addEventListener('click', closeMagnifier);
  magnifierElement.querySelector('.magnifier-zoom-in').addEventListener('click', () => {
    currentZoom += 2;
    updateMagnifierZoom();
  });
  magnifierElement.querySelector('.magnifier-zoom-out').addEventListener('click', () => {
    if (currentZoom > 12) {
      currentZoom -= 2;
      updateMagnifierZoom();
    }
  });
  magnifierElement.querySelector('.magnifier-header').addEventListener('mousedown', startDrag);

  document.body.appendChild(magnifierElement);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateMagnifierZoom() {
  if (magnifierElement) {
    const content = magnifierElement.querySelector('.magnifier-content');
    if (content) content.style.fontSize = `${currentZoom}px`;
  }
}

function updateMagnifierTheme() {
  if (!magnifierElement) return;

  if (currentTheme === 'dark') {
    magnifierElement.style.backgroundColor = '#2d2d2d';
    magnifierElement.style.color = '#e0e0e0';
    magnifierElement.style.border = '1px solid #444';
    magnifierElement.querySelectorAll('.magnifier-btn').forEach(btn => {
      btn.style.backgroundColor = '#444';
      btn.style.color = '#e0e0e0';
    });
  } else {
    magnifierElement.style.backgroundColor = '#ffffff';
    magnifierElement.style.color = '#1e1e2e';
    magnifierElement.style.border = '1px solid #e5e7eb';
    magnifierElement.querySelectorAll('.magnifier-btn').forEach(btn => {
      btn.style.backgroundColor = '#f4f5f7';
      btn.style.color = '#1e1e2e';
    });
  }
}

function closeMagnifier() {
  if (magnifierElement) {
    magnifierElement.remove();
    magnifierElement = null;
  }
}

// Drag functionality
function startDrag(e) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();

  isDragging = true;
  const rect = magnifierElement.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
  magnifierElement.style.cursor = 'grabbing';
}

function drag(e) {
  if (!isDragging || !magnifierElement) return;
  e.preventDefault();

  const maxX = window.innerWidth - magnifierElement.offsetWidth;
  const maxY = window.innerHeight - magnifierElement.offsetHeight;
  const newX = Math.max(0, Math.min(e.clientX - dragOffsetX, maxX));
  const newY = Math.max(0, Math.min(e.clientY - dragOffsetY, maxY));

  magnifierElement.style.left = `${newX}px`;
  magnifierElement.style.top = `${newY}px`;
  magnifierElement.style.right = 'auto';
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
  if (magnifierElement) magnifierElement.style.cursor = 'default';
}

// ==================== READING RULER ====================

function createReadingRuler() {
  if (readingRulerElement) return;

  readingRulerElement = document.createElement('div');
  readingRulerElement.className = 'vision-helper-reading-ruler';
  readingRulerElement.style.cssText = `
    position: fixed; left: 0; right: 0;
    height: 40px;
    background: rgba(13, 147, 115, 0.10);
    border-top: 2px solid rgba(13, 147, 115, 0.35);
    border-bottom: 2px solid rgba(13, 147, 115, 0.35);
    pointer-events: none;
    z-index: 2147483644;
    transition: top 0.08s ease-out;
    display: none;
  `;

  document.body.appendChild(readingRulerElement);
  document.addEventListener('mousemove', updateReadingRulerPosition);
}

function updateReadingRulerPosition(e) {
  if (!readingRulerElement || !readingRulerEnabled) return;
  readingRulerElement.style.top = `${e.clientY - 20}px`;
}

function toggleReadingRuler(enabled) {
  readingRulerEnabled = enabled;

  if (enabled) {
    if (!readingRulerElement && document.body) {
      createReadingRuler();
    }
    if (readingRulerElement) {
      readingRulerElement.style.display = 'block';
    }
  } else {
    if (readingRulerElement) {
      readingRulerElement.style.display = 'none';
    }
  }
}
