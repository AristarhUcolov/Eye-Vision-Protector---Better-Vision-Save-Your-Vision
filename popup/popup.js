document.addEventListener('DOMContentLoaded', function() {
  // Загрузка текущих настроек
  loadSettings();
  
  // Инициализация перевода
  initTranslations();
  
  // Установка обработчиков событий
  setupEventListeners();
  
  // Проверка текущей темы
  checkCurrentTheme();
});

// Загрузка текущих настроек
function loadSettings() {
  chrome.storage.sync.get([
    'fontSize', 'boldText', 'selectedFont', 
    'darkMode', 'colorBlindMode', 'textToSpeech',
    'magnifierEnabled', 'showTimeNotification', 'language',
    'currentTheme'
  ], function(data) {
    document.getElementById('font-size').value = data.fontSize || 0;
    document.getElementById('font-size-value').textContent = data.fontSize || 0;
    document.getElementById('bold-text').checked = data.boldText || false;
    document.getElementById('font-family').value = data.selectedFont || 'Arial';
    document.getElementById('dark-mode').value = data.darkMode || 'auto';
    document.getElementById('color-blind-mode').value = data.colorBlindMode || 'none';
    document.getElementById('text-to-speech').checked = data.textToSpeech !== false;
    document.getElementById('magnifier-enabled').checked = data.magnifierEnabled !== false;
    document.getElementById('show-time-notification').checked = data.showTimeNotification !== false;
    document.getElementById('language-selector').value = data.language || 'en';
    
    // Применяем тему сразу при загрузке
    if (data.currentTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  });
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
  // Размер шрифта
  document.getElementById('font-size').addEventListener('input', function() {
    const value = this.value;
    document.getElementById('font-size-value').textContent = value;
    chrome.storage.sync.set({ fontSize: parseInt(value) }, applyChanges);
  });
  
  // Жирный текст
  document.getElementById('bold-text').addEventListener('change', function() {
    chrome.storage.sync.set({ boldText: this.checked }, function() {
      applyChanges();
      // Принудительное обновление темы для немедленного применения изменений
      chrome.storage.sync.get(['currentTheme'], function(data) {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: "applyTheme",
              theme: data.currentTheme
            });
          });
        });
      });
    });
  });
  
  // Шрифт
  document.getElementById('font-family').addEventListener('change', function() {
    chrome.storage.sync.set({ selectedFont: this.value }, applyChanges);
  });
  
  // Темная тема
  document.getElementById('dark-mode').addEventListener('change', function() {
    const mode = this.value;
    chrome.storage.sync.set({ darkMode: mode }, function() {
      if (mode === 'auto') {
        checkTimeForTheme();
      } else {
        chrome.storage.sync.set({ currentTheme: mode }, function() {
          applyChanges();
          // Обновляем тему popup
          if (mode === 'dark') {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
        });
      }
    });
  });
  
  // Режим для дальтоников
  document.getElementById('color-blind-mode').addEventListener('change', function() {
    chrome.storage.sync.set({ colorBlindMode: this.value }, applyChanges);
  });
  
  // Озвучивание текста
  document.getElementById('text-to-speech').addEventListener('change', function() {
    chrome.storage.sync.set({ textToSpeech: this.checked }, function() {
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
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
  
  // Кнопка "Купить кофе"
  document.getElementById('buy-me-coffee').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://buymeacoffee.com/aristarh.ucolov' });
  });
  
  // Кнопка "Банковский перевод"
  document.getElementById('bank-transfer').addEventListener('click', function() {
    chrome.storage.sync.get(['language'], function(data) {
      const message = data.language === 'ru' ? 
        "Для банковского перевода используйте реквизиты: \n\nБанк: Moldindconbank\nНомер карты: 4028 1202 1106 0963\nПолучатель: Аристарх Уколов" :
        "For bank transfer use details: \n\nBank: Moldindconbank\nCard number: 4028 1202 1106 0963\nRecipient: Aristarh Ucolov";
      alert(message);
    });
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
    "colorBlindMode": "Color Blind Mode",
    "none": "None",
    "protanopia": "Protanopia (red-blind)",
    "deuteranopia": "Deuteranopia (green-blind)",
    "tritanopia": "Tritanopia (blue-blind)",
    "achromatopsia": "Achromatopsia (total color blindness)",
    "accessibilityTools": "Accessibility Tools",
    "enableTextToSpeech": "Enable Text-to-Speech",
    "enableMagnifier": "Enable Text Magnifier",
    "showTimeNotifications": "Show Theme Change Notifications",
    "supportProject": "Support the Project",
    "donateMessage": "If you find this extension helpful, consider supporting its development:",
    "buyMeCoffee": "Buy Me a Coffee",
    "bankTransfer": "Bank Transfer",
    "advancedSettings": "Advanced Settings"
  };
}

function getRussianTranslations() {
  return {
    "appName": "Помощник зрения",
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
    "colorBlindMode": "Режим для дальтоников",
    "none": "Нет",
    "protanopia": "Протанопия (не видят красный)",
    "deuteranopia": "Дейтеранопия (не видят зелёный)",
    "tritanopia": "Тританопия (не видят синий)",
    "achromatopsia": "Ахроматопсия (полная цветовая слепота)",
    "accessibilityTools": "Инструменты доступности",
    "enableTextToSpeech": "Озвучивание текста",
    "enableMagnifier": "Лупа для текста",
    "showTimeNotifications": "Уведомления о смене темы",
    "supportProject": "Поддержать проект",
    "donateMessage": "Если это расширение вам помогает, рассмотрите возможность поддержать его разработку:",
    "buyMeCoffee": "Купить кофе",
    "bankTransfer": "Банковский перевод",
    "advancedSettings": "Дополнительные настройки"
  };
}