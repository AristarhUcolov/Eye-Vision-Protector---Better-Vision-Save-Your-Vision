document.addEventListener('DOMContentLoaded', function() {
  // Загрузка пользовательского CSS
  chrome.storage.sync.get(['customCSS'], function(data) {
    if (data.customCSS) {
      document.getElementById('custom-css').value = data.customCSS;
    }
  });
  
  // Инициализация перевода
  initTranslations();
  
  // Проверка текущей темы
  checkCurrentTheme();
  
  // Установка обработчиков событий
  document.getElementById('save-css').addEventListener('click', saveCustomCSS);
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  document.getElementById('language-selector').addEventListener('change', changeLanguage);
});

// Сохранение пользовательского CSS
function saveCustomCSS() {
  const customCSS = document.getElementById('custom-css').value;
  chrome.storage.sync.set({ customCSS: customCSS }, function() {
    // Применяем CSS на всех вкладках
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "applyCustomCSS", 
          css: customCSS 
        });
      });
    });
    
    showMessage('Custom CSS saved successfully!');
  });
}

// Сброс настроек
function resetSettings() {
  if (confirm(chrome.i18n.getMessage('resetConfirm'))) {
    chrome.storage.sync.clear(function() {
      // Устанавливаем значения по умолчанию
      chrome.storage.sync.set({
        fontSize: 0,
        boldText: false,
        selectedFont: 'Arial',
        darkMode: 'auto',
        colorBlindMode: 'none',
        textToSpeech: true,
        magnifierEnabled: true,
        showTimeNotification: true,
        currentTheme: 'light',
        customCSS: ''
      }, function() {
        // Обновляем страницу настроек
        location.reload();
        // Применяем изменения на всех вкладках
        chrome.tabs.query({}, function(tabs) {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "applyStyles" });
          });
        });
      });
    });
  }
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
  
  // Обновляем заголовок страницы
  document.title = messages['appName'] + ' - ' + messages['advancedSettings'];
}

// Изменение языка
function changeLanguage() {
  const language = this.value;
  chrome.storage.sync.set({ language: language });
  updateTranslations(language);
}

// Проверка текущей темы для options
function checkCurrentTheme() {
  chrome.storage.sync.get(['currentTheme'], function(data) {
    if (data.currentTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  });
}

// Показать сообщение
function showMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.style.position = 'fixed';
  messageElement.style.bottom = '20px';
  messageElement.style.right = '20px';
  messageElement.style.padding = '10px 15px';
  messageElement.style.backgroundColor = '#4a89dc';
  messageElement.style.color = 'white';
  messageElement.style.borderRadius = '4px';
  messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  messageElement.style.zIndex = '1000';
  messageElement.textContent = message;
  
  document.body.appendChild(messageElement);
  
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.5s';
    setTimeout(() => messageElement.remove(), 500);
  }, 3000);
}

// Временные функции переводов
function getEnglishTranslations() {
  return {
    "appName": "Vision Helper",
    "advancedSettings": "Advanced Settings",
    "customCSS": "Custom CSS",
    "customCSSDescription": "Add your own CSS rules to further customize website appearance:",
    "save": "Save",
    "keyboardShortcuts": "Keyboard Shortcuts",
    "toggleDarkMode": "Toggle Dark Mode:",
    "increaseFontSize": "Increase Font Size:",
    "decreaseFontSize": "Decrease Font Size:",
    "resetSettings": "Reset Settings",
    "resetWarning": "Warning: This will restore all settings to their default values.",
    "resetToDefaults": "Reset to Defaults",
    "resetConfirm": "Are you sure you want to reset all settings to default values?"
  };
}

function getRussianTranslations() {
  return {
    "appName": "Помощник зрения",
    "advancedSettings": "Дополнительные настройки",
    "customCSS": "Пользовательский CSS",
    "customCSSDescription": "Добавьте свои CSS-правила для дополнительной настройки внешнего вида сайтов:",
    "save": "Сохранить",
    "keyboardShortcuts": "Горячие клавиши",
    "toggleDarkMode": "Переключить тёмную тему:",
    "increaseFontSize": "Увеличить размер шрифта:",
    "decreaseFontSize": "Уменьшить размер шрифта:",
    "resetSettings": "Сброс настроек",
    "resetWarning": "Внимание: Это восстановит все настройки до значений по умолчанию.",
    "resetToDefaults": "Сбросить настройки",
    "resetConfirm": "Вы уверены, что хотите сбросить все настройки до значений по умолчанию?"
  };
}