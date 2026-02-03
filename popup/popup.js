document.addEventListener('DOMContentLoaded', function() {
  // Загрузка текущих настроек
  loadSettings();
  
  // Инициализация перевода
  initTranslations();
  
  // Установка обработчиков событий
  setupEventListeners();
  
  // Проверка текущей темы
  checkCurrentTheme();
  
  // Загрузка статистики
  loadStats();
  
  // Обновление статистики каждые 30 секунд
  setInterval(loadStats, 30000);
});

// Загрузка статистики использования
function loadStats() {
  chrome.storage.sync.get(['usageStats'], function(data) {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0 };
    
    // Конвертируем минуты в часы
    const hours = Math.floor(stats.totalTimeUsed / 60);
    const minutes = stats.totalTimeUsed % 60;
    
    let timeStr = hours > 0 ? `${hours}h` : `${minutes}m`;
    document.getElementById('active-time').textContent = timeStr;
    document.getElementById('theme-switches').textContent = stats.themeSwitches || 0;
  });
}

// Загрузка текущих настроек
function loadSettings() {
  chrome.storage.sync.get([
    'fontSize', 'boldText', 'selectedFont', 
    'darkMode', 'darkModeIntensity', 'blueLightFilter', 'blueLightIntensity',
    'colorBlindMode', 'textToSpeech', 'focusMode',
    'magnifierEnabled', 'showTimeNotification', 'language',
    'currentTheme', 'speechVolume'
  ], function(data) {
    document.getElementById('font-size').value = data.fontSize || 0;
    document.getElementById('font-size-value').textContent = data.fontSize || 0;
    document.getElementById('bold-text').checked = data.boldText || false;
    document.getElementById('font-family').value = data.selectedFont || 'Arial';
    document.getElementById('dark-mode').value = data.darkMode || 'auto';
    document.getElementById('dark-mode-intensity').value = data.darkModeIntensity || 85;
    document.getElementById('dark-intensity-value').textContent = (data.darkModeIntensity || 85) + '%';
    document.getElementById('blue-light-filter').checked = data.blueLightFilter || false;
    document.getElementById('blue-light-intensity').value = data.blueLightIntensity || 50;
    document.getElementById('blue-intensity-value').textContent = (data.blueLightIntensity || 50) + '%';
    document.getElementById('color-blind-mode').value = data.colorBlindMode || 'none';
    document.getElementById('text-to-speech').checked = data.textToSpeech !== false;
    document.getElementById('speech-volume').value = data.speechVolume || 100;
    document.getElementById('speech-volume-value').textContent = (data.speechVolume || 100) + '%';
    document.getElementById('focus-mode').checked = data.focusMode || false;
    document.getElementById('magnifier-enabled').checked = data.magnifierEnabled !== false;
    document.getElementById('show-time-notification').checked = data.showTimeNotification !== false;
    document.getElementById('language-selector').value = data.language || 'en';
    
    // Показать/скрыть дополнительные настройки
    updateDarkIntensityVisibility(data.darkMode);
    updateBlueLightIntensityVisibility(data.blueLightFilter);
    updateSpeechVolumeVisibility(data.textToSpeech !== false);
    
    // Применяем тему сразу при загрузке
    if (data.currentTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  });
}

// Обновление видимости настройки интенсивности темной темы
function updateDarkIntensityVisibility(mode) {
  const group = document.getElementById('dark-intensity-group');
  if (mode === 'dark' || mode === 'auto') {
    group.style.display = 'block';
  } else {
    group.style.display = 'none';
  }
}

// Обновление видимости настройки интенсивности синего фильтра
function updateBlueLightIntensityVisibility(enabled) {
  const group = document.getElementById('blue-light-intensity-group');
  group.style.display = enabled ? 'block' : 'none';
}

// Обновление видимости настройки громкости речи
function updateSpeechVolumeVisibility(enabled) {
  const group = document.getElementById('speech-volume-group');
  group.style.display = enabled ? 'block' : 'none';
}

// Инициализация перевода
function initTranslations() {
  // Установка языка из хранилища или браузера
  chrome.storage.sync.get(['language'], function(data) {
    const language = data.language || chrome.i18n.getUILanguage().split('-')[0];
    document.getElementById('language-selector').value = language === 'ru' ? 'ru' : 'en';
    updateTranslations(language);
  });
}

// Обновление текстов на странице
function updateTranslations(language) {
  // Загружаем переводы
  const messages = language === 'ru' ? getRussianTranslations() : getEnglishTranslations();
  
  // Обновляем все элементы с атрибутом data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (messages[key]) {
      if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
        element.value = messages[key];
      } else {
        element.textContent = messages[key];
      }
    }
  });
  
  // Обновляем опции select элементов
  updateSelectOptionsTranslation(language);
}

// Обновление переводов для опций select
function updateSelectOptionsTranslation(language) {
  const selects = {
    'font-family': {
      'Arial': language === 'ru' ? 'Arial' : 'Arial',
      'Verdana': language === 'ru' ? 'Verdana' : 'Verdana',
      'Helvetica': language === 'ru' ? 'Helvetica' : 'Helvetica',
      'Tahoma': language === 'ru' ? 'Tahoma' : 'Tahoma',
      'Times New Roman': language === 'ru' ? 'Times New Roman' : 'Times New Roman',
      'Georgia': language === 'ru' ? 'Georgia' : 'Georgia',
      'Courier New': language === 'ru' ? 'Courier New' : 'Courier New',
      'OpenDyslexic': language === 'ru' ? 'OpenDyslexic' : 'OpenDyslexic',
      'Comic Sans MS': language === 'ru' ? 'Comic Sans MS' : 'Comic Sans MS'
    },
    'dark-mode': {
      'auto': language === 'ru' ? 'Авто (по времени)' : 'Auto (by time)',
      'light': language === 'ru' ? 'Светлая' : 'Light',
      'dark': language === 'ru' ? 'Тёмная' : 'Dark'
    },
    'color-blind-mode': {
      'none': language === 'ru' ? 'Нет' : 'None',
      'protanopia': language === 'ru' ? 'Протанопия (не видят красный)' : 'Protanopia (red-blind)',
      'deuteranopia': language === 'ru' ? 'Дейтеранопия (не видят зелёный)' : 'Deuteranopia (green-blind)',
      'tritanopia': language === 'ru' ? 'Тританопия (не видят синий)' : 'Tritanopia (blue-blind)',
      'achromatopsia': language === 'ru' ? 'Ахроматопсия (полная цветовая слепота)' : 'Achromatopsia (total color blindness)'
    }
  };
  
  for (const selectId in selects) {
    const select = document.getElementById(selectId);
    if (select) {
      Array.from(select.options).forEach(option => {
        if (selects[selectId][option.value]) {
          option.text = selects[selectId][option.value];
        }
      });
    }
  }
}

// Установка обработчиков событий
function setupEventListeners() {
  // Быстрое переключение темы
  document.getElementById('quick-toggle-theme').addEventListener('click', function() {
    chrome.storage.sync.get(['currentTheme'], function(data) {
      const newTheme = data.currentTheme === 'dark' ? 'light' : 'dark';
      chrome.storage.sync.set({ currentTheme: newTheme, darkMode: newTheme }, function() {
        // Обновление статистики
        updateThemeSwitchStats();
        applyChanges();
        if (newTheme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
    });
  });
  
  // Размер шрифта
  document.getElementById('font-size').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('font-size-value').textContent = value;
    chrome.storage.sync.set({ fontSize: parseInt(value) }, applyChanges);
  });
  
  // Жирный текст
  document.getElementById('bold-text').addEventListener('change', function() {
    chrome.storage.sync.set({ boldText: this.checked }, applyChanges);
  });
  
  // Шрифт
  document.getElementById('font-family').addEventListener('change', function() {
    chrome.storage.sync.set({ selectedFont: this.value }, applyChanges);
  });
  
  // Темная тема
  document.getElementById('dark-mode').addEventListener('change', function() {
    const mode = this.value;
    updateDarkIntensityVisibility(mode);
    
    chrome.storage.sync.set({ darkMode: mode }, function() {
      if (mode === 'auto') {
        checkTimeForTheme();
      } else {
        chrome.storage.sync.set({ currentTheme: mode }, function() {
          updateThemeSwitchStats();
          applyChanges();
          if (mode === 'dark') {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
        });
      }
    });
  });
  
  // Интенсивность темной темы
  document.getElementById('dark-mode-intensity').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('dark-intensity-value').textContent = value + '%';
    chrome.storage.sync.set({ darkModeIntensity: parseInt(value) }, applyChanges);
  });
  
  // Фильтр синего света
  document.getElementById('blue-light-filter').addEventListener('change', function() {
    const enabled = this.checked;
    updateBlueLightIntensityVisibility(enabled);
    chrome.storage.sync.set({ blueLightFilter: enabled }, applyChanges);
  });
  
  // Интенсивность фильтра синего света
  document.getElementById('blue-light-intensity').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('blue-intensity-value').textContent = value + '%';
    chrome.storage.sync.set({ blueLightIntensity: parseInt(value) }, applyChanges);
  });
  
  // Режим фокуса
  document.getElementById('focus-mode').addEventListener('change', function() {
    chrome.storage.sync.set({ focusMode: this.checked }, applyChanges);
  });
  
  // Режим для дальтоников
  document.getElementById('color-blind-mode').addEventListener('change', function() {
    chrome.storage.sync.set({ colorBlindMode: this.value }, applyChanges);
  });
  
  // Озвучивание текста
  document.getElementById('text-to-speech').addEventListener('change', function() {
    const enabled = this.checked;
    updateSpeechVolumeVisibility(enabled);
    chrome.storage.sync.set({ textToSpeech: enabled }, function() {
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
  });
  
  // Громкость речи
  document.getElementById('speech-volume').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('speech-volume-value').textContent = value + '%';
    chrome.storage.sync.set({ speechVolume: parseInt(value) });
  });
  
  // Лупа для текста
  document.getElementById('magnifier-enabled').addEventListener('change', function() {
    chrome.storage.sync.set({ magnifierEnabled: this.checked }, function() {
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
  });
  
  // Уведомления о смене темы
  document.getElementById('show-time-notification').addEventListener('change', function() {
    chrome.storage.sync.set({ showTimeNotification: this.checked });
  });
  
  // Donation buttons
  document.getElementById('buy-me-coffee').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://buymeacoffee.com/aristarh.ucolov' });
  });
  
  document.getElementById('bank-transfer').addEventListener('click', function() {
    alert('Bank transfer details:\nBank: Moldindconbank\nCard: 4028 1202 1106 0963\nRecipient: Aristarh Ucolov\n\nThank you for your support!');
  });
  
  // Кнопка "Дополнительные настройки"
  document.getElementById('options-button').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // Изменение языка
  document.getElementById('language-selector').addEventListener('change', function() {
    const language = this.value;
    chrome.storage.sync.set({ language: language }, function() {
      updateTranslations(language);
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
      
      // Обновляем тему popup после смены языка
      chrome.storage.sync.get(['currentTheme'], function(data) {
        if (data.currentTheme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
    });
  });
}

// Обновление статистики переключений темы
function updateThemeSwitchStats() {
  chrome.storage.sync.get(['usageStats'], function(data) {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0, lastUsed: Date.now() };
    stats.themeSwitches = (stats.themeSwitches || 0) + 1;
    stats.lastUsed = Date.now();
    chrome.storage.sync.set({ usageStats: stats });
    loadStats();
  });
}

// Применение изменений на всех вкладках
function applyChanges() {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: "applyStyles" });
    });
  });
}

// Проверка текущей темы для popup
function checkCurrentTheme() {
  chrome.storage.sync.get(['currentTheme'], function(data) {
    if (data.currentTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  });
}

// Проверка времени для автоматической темы
function checkTimeForTheme() {
  chrome.runtime.sendMessage({ action: "checkTimeForTheme" });
}

// Временные функции переводов (в реальном расширении используются _locales)
function getEnglishTranslations() {
  return {
    "appName": "Vision Helper",
    "activeTime": "Active",
    "switches": "Switches",
    "textSettings": "Text Settings",
    "fontSize": "Font Size",
    "standard": "Standard",
    "fontFamily": "Font Family",
    "boldText": "Bold Text",
    "colorSettings": "Color Settings",
    "colorTheme": "Color Theme",
    "auto": "Auto (by time)",
    "lightTheme": "Light",
    "darkTheme": "Dark",
    "darkIntensity": "Dark Mode Intensity",
    "blueLightFilter": "Blue Light Filter",
    "blueIntensity": "Filter Intensity",
    "focusMode": "Focus Mode (Dim Distractions)",
    "colorBlindMode": "Color Blind Mode",
    "none": "None",
    "protanopia": "Protanopia (red-blind)",
    "deuteranopia": "Deuteranopia (green-blind)",
    "tritanopia": "Tritanopia (blue-blind)",
    "achromatopsia": "Achromatopsia (total color blindness)",
    "accessibilityTools": "Accessibility Tools",
    "enableTextToSpeech": "Text-to-Speech",
    "speechVolume": "Speech Volume",
    "enableMagnifier": "Text Magnifier",
    "showTimeNotifications": "Theme Change Notifications",
    "supportProject": "Support Project",
    "donateMessage": "If you find this extension helpful, consider supporting its development!",
    "buyMeCoffee": "Buy Me a Coffee",
    "bankTransfer": "Bank Transfer",
    "advancedSettings": "Advanced Settings"
  };
}

function getRussianTranslations() {
  return {
    "appName": "Помощник зрения",
    "activeTime": "Активен",
    "switches": "Переключ.",
    "textSettings": "Настройки текста",
    "fontSize": "Размер шрифта",
    "standard": "Стандарт",
    "fontFamily": "Шрифт",
    "boldText": "Жирный текст",
    "colorSettings": "Настройки цвета",
    "colorTheme": "Цветовая тема",
    "auto": "Авто (по времени)",
    "lightTheme": "Светлая",
    "darkTheme": "Тёмная",
    "darkIntensity": "Интенсивность тёмной темы",
    "blueLightFilter": "Фильтр синего света",
    "blueIntensity": "Интенсивность фильтра",
    "focusMode": "Режим фокуса (затемнение отвлекающих элементов)",
    "colorBlindMode": "Режим для дальтоников",
    "none": "Нет",
    "protanopia": "Протанопия (не видят красный)",
    "deuteranopia": "Дейтеранопия (не видят зелёный)",
    "tritanopia": "Тританопия (не видят синий)",
    "achromatopsia": "Ахроматопсия (полная цветовая слепота)",
    "accessibilityTools": "Инструменты доступности",
    "enableTextToSpeech": "Озвучивание текста",
    "speechVolume": "Громкость речи",
    "enableMagnifier": "Лупа для текста",
    "showTimeNotifications": "Уведомления о смене темы",
    "supportProject": "Поддержать проект",
    "donateMessage": "Если это расширение помогает вам, рассмотрите возможность поддержки его разработки!",
    "buyMeCoffee": "Купить мне кофе",
    "bankTransfer": "Банковский перевод",
    "advancedSettings": "Дополнительные настройки"
  };
}