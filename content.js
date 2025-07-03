// Скрипт, который внедряется на все страницы
let stylesApplied = false;
let currentTheme = 'light';
let magnifierElement = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentZoom = 24; // базовый размер шрифта

// Применение стилей при загрузке страницы
applyStyles();

// Слушатель сообщений от фонового скрипта и popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyStyles") {
    applyStyles(request.data);
  } else if (request.action === "applyTheme") {
    applyTheme(request.theme);
    updateMagnifierTheme();
  } else if (request.action === "showMagnifier") {
    showMagnifier(request.text);
  } else if (request.action === "applyCustomCSS") {
    applyCustomCSS(request.css);
  } else if (request.action === "getCurrentSettings") {
    chrome.storage.sync.get([
      'fontSize', 'boldText', 'selectedFont', 
      'darkMode', 'currentTheme', 'colorBlindMode'
    ], (data) => {
      sendResponse(data);
    });
    return true;
  }
});

// Функция применения стилей
function applyStyles(settings) {
  if (!settings) {
    chrome.storage.sync.get([
      'fontSize', 'boldText', 'selectedFont', 
      'currentTheme', 'colorBlindMode'
    ], (data) => {
      applyStyles(data);
    });
    return;
  }

  // Удаляем предыдущие стили, если они были применены
  if (stylesApplied) {
    const oldStyle = document.getElementById('vision-helper-styles');
    if (oldStyle) oldStyle.remove();
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'vision-helper-styles';
  
  let cssRules = `
    *:not(.vision-helper-magnifier):not(.vision-helper-magnifier *) {
      font-family: ${settings.selectedFont || 'Arial'}, sans-serif !important;
  `;

  // Размер шрифта
  if (settings.fontSize > 0) {
    cssRules += `
      font-size: ${16 + settings.fontSize}px !important;
      line-height: ${1.2 + (settings.fontSize * 0.05)} !important;
    `;
  }

  // Жирный текст
  if (settings.boldText) {
    cssRules += `font-weight: bold !important;`;
  }

  cssRules += `}`;

  // Цветовая слепота
  if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
    cssRules += getColorBlindFilter(settings.colorBlindMode);
  }

  styleElement.textContent = cssRules;
  document.head.appendChild(styleElement);
  stylesApplied = true;

  // Применение темы
  if (settings.currentTheme) {
    applyTheme(settings.currentTheme);
  } else {
    applyTheme('light');
  }
}

// Применение пользовательского CSS
function applyCustomCSS(css) {
  let customStyle = document.getElementById('vision-helper-custom-css');
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'vision-helper-custom-css';
    document.head.appendChild(customStyle);
  }
  customStyle.textContent = css;
}

// Применение темы (светлая/темная)
function applyTheme(theme) {
  currentTheme = theme;
  const styleElement = document.getElementById('vision-helper-theme') || document.createElement('style');
  styleElement.id = 'vision-helper-theme';
  
  if (theme === 'dark') {
    styleElement.textContent = `
      :root {
        --vh-bg-color: #1a1a1a !important;
        --vh-text-color: #e0e0e0 !important;
        --vh-link-color: #7db4ff !important;
        --vh-input-bg: #2d2d2d !important;
        --vh-input-text: #e0e0e0 !important;
        --vh-border-color: #444 !important;
      }
      body, html {
        background-color: var(--vh-bg-color) !important;
        color: var(--vh-text-color) !important;
      }
      a {
        color: var(--vh-link-color) !important;
      }
      input, textarea, select, button {
        background-color: var(--vh-input-bg) !important;
        color: var(--vh-input-text) !important;
        border-color: var(--vh-border-color) !important;
      }
    `;
    
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    styleElement.textContent = `
      :root {
        --vh-bg-color: #ffffff !important;
        --vh-text-color: #000000 !important;
        --vh-link-color: #0066cc !important;
        --vh-input-bg: #ffffff !important;
        --vh-input-text: #000000 !important;
        --vh-border-color: #ccc !important;
      }
      body, html {
        background-color: var(--vh-bg-color) !important;
        color: var(--vh-text-color) !important;
      }
      a {
        color: var(--vh-link-color) !important;
      }
      input, textarea, select, button {
        background-color: var(--vh-input-bg) !important;
        color: var(--vh-input-text) !important;
        border-color: var(--vh-border-color) !important;
      }
    `;
    
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
  
  if (!document.getElementById('vision-helper-theme')) {
    document.head.appendChild(styleElement);
  }
  
  applySiteSpecificThemeFixes();
  updateMagnifierTheme();
}

// Показать лупу для текста
function showMagnifier(text) {
  if (!text) return;

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
  magnifierElement.style.position = 'fixed';
  magnifierElement.style.zIndex = '999999';
  magnifierElement.style.top = '20px';
  magnifierElement.style.right = '20px';
  magnifierElement.style.width = '300px';
  magnifierElement.style.padding = '15px';
  magnifierElement.style.borderRadius = '8px';
  magnifierElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  magnifierElement.style.userSelect = 'none';
  updateMagnifierTheme();

  magnifierElement.innerHTML = `
    <div class="magnifier-header">
      <div class="magnifier-title">${chrome.i18n.getMessage("magnifierTitle")}</div>
      <div class="magnifier-controls">
        <button class="magnifier-btn magnifier-zoom-in" title="${chrome.i18n.getMessage("zoomIn")}">+</button>
        <button class="magnifier-btn magnifier-zoom-out" title="${chrome.i18n.getMessage("zoomOut")}">-</button>
        <button class="magnifier-btn magnifier-close" title="${chrome.i18n.getMessage("close")}">×</button>
      </div>
    </div>
    <div class="magnifier-content" style="
      max-height: 300px;
      overflow-y: auto;
      font-size: ${currentZoom}px;
      line-height: 1.5;
    ">${text}</div>
  `;

  const closeBtn = magnifierElement.querySelector('.magnifier-close');
  closeBtn.addEventListener('click', closeMagnifier);

  const zoomIn = magnifierElement.querySelector('.magnifier-zoom-in');
  zoomIn.addEventListener('click', () => {
    currentZoom += 2;
    updateMagnifierZoom();
  });

  const zoomOut = magnifierElement.querySelector('.magnifier-zoom-out');
  zoomOut.addEventListener('click', () => {
    if (currentZoom > 12) {
      currentZoom -= 2;
      updateMagnifierZoom();
    }
  });

  const header = magnifierElement.querySelector('.magnifier-header');
  header.addEventListener('mousedown', startDrag);

  document.body.appendChild(magnifierElement);
}

function updateMagnifierZoom() {
  if (magnifierElement) {
    const content = magnifierElement.querySelector('.magnifier-content');
    if (content) {
      content.style.fontSize = `${currentZoom}px`;
    }
  }
}

function updateMagnifierTheme() {
  if (!magnifierElement) return;
  
  if (currentTheme === 'dark') {
    magnifierElement.style.backgroundColor = '#2d2d2d';
    magnifierElement.style.color = '#e0e0e0';
    magnifierElement.style.border = '1px solid #444';
    
    const buttons = magnifierElement.querySelectorAll('.magnifier-btn');
    buttons.forEach(btn => {
      btn.style.backgroundColor = '#444';
      btn.style.color = '#e0e0e0';
    });
  } else {
    magnifierElement.style.backgroundColor = '#ffffff';
    magnifierElement.style.color = '#000000';
    magnifierElement.style.border = '1px solid #ccc';
    
    const buttons = magnifierElement.querySelectorAll('.magnifier-btn');
    buttons.forEach(btn => {
      btn.style.backgroundColor = '#eee';
      btn.style.color = '#000';
    });
  }
}

function closeMagnifier() {
  if (magnifierElement) {
    magnifierElement.remove();
    magnifierElement = null;
  }
}

function startDrag(e) {
  if (e.button !== 0) return;
  
  isDragging = true;
  const rect = magnifierElement.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
  magnifierElement.style.cursor = 'grabbing';
}

function drag(e) {
  if (!isDragging) return;
  
  magnifierElement.style.left = `${e.clientX - dragOffsetX}px`;
  magnifierElement.style.top = `${e.clientY - dragOffsetY}px`;
  magnifierElement.style.right = 'auto';
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
  magnifierElement.style.cursor = 'default';
}

// Фильтры для разных типов дальтонизма
function getColorBlindFilter(type) {
  const filters = {
    'protanopia': 'url(#protanopia)',
    'deuteranopia': 'url(#deuteranopia)',
    'tritanopia': 'url(#tritanopia)',
    'achromatopsia': 'url(#achromatopsia)'
  };
  
  return `
    svg.vision-helper-svg-filter {
      position: absolute;
      width: 0;
      height: 0;
    }
    html {
      filter: ${filters[type]};
    }
    .vision-helper-magnifier {
      filter: none !important;
    }
  `;
}

// Применение исправлений для конкретных сайтов
function applySiteSpecificThemeFixes() {
  const fixStyle = document.getElementById('vision-helper-site-fixes') || document.createElement('style');
  fixStyle.id = 'vision-helper-site-fixes';
  
  fixStyle.textContent = `
    .dark-theme .header, 
    .dark-theme .navbar,
    .dark-theme .footer {
      background-color: #121212 !important;
      border-color: #333 !important;
    }
    
    .dark-theme .card,
    .dark-theme .panel,
    .dark-theme .modal-content {
      background-color: #2d2d2d !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }
    
    .dark-theme .ytd-app {
      background-color: #1a1a1a !important;
    }
    
    .dark-theme .twitter-tweet {
      background-color: #2d2d2d !important;
    }
  `;
  
  if (!document.getElementById('vision-helper-site-fixes')) {
    document.head.appendChild(fixStyle);
  }
}

// Добавляем SVG фильтры для дальтонизма
const svgFilters = document.createElement('svg');
svgFilters.className = 'vision-helper-svg-filter';
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

// Стили для лупы
const magnifierStyles = document.createElement('style');
magnifierStyles.textContent = `
  .vision-helper-magnifier {
    transition: all 0.2s ease;
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
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .magnifier-btn:hover {
    opacity: 0.9;
  }
  .magnifier-content {
    padding: 5px;
  }
`;
document.head.appendChild(magnifierStyles);