document.addEventListener('DOMContentLoaded', function() {
  // Инициализация вкладок
  initTabs();
  
  // Загрузка пользовательского CSS
  loadCustomCSS();
  
  // Загрузка отключенных сайтов
  loadDisabledSites();
  
  // Загрузка статистики
  loadStatistics();
  
  // Инициализация перевода
  initTranslations();
  
  // Установка обработчиков событий
  setupEventListeners();
});

// Инициализация вкладок
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Убираем активный класс со всех кнопок и контента
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Добавляем активный класс к выбранным элементам
      button.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Загрузка пользовательского CSS
function loadCustomCSS() {
  chrome.storage.sync.get(['customCSS'], function(data) {
    if (data.customCSS) {
      document.getElementById('custom-css-editor').value = data.customCSS;
    }
  });
}

// Загрузка отключенных сайтов
function loadDisabledSites() {
  chrome.storage.sync.get(['disabledSites'], function(data) {
    const sites = data.disabledSites || [];
    const listElement = document.getElementById('disabled-sites-list');
    
    if (sites.length === 0) {
      listElement.innerHTML = '<div class="empty-state"><span>No disabled sites yet</span></div>';
      return;
    }
    
    listElement.innerHTML = '';
    sites.forEach(site => {
      const siteItem = document.createElement('div');
      siteItem.className = 'site-item';
      siteItem.innerHTML = `
        <span>${site}</span>
        <button class="remove-site" data-site="${site}">❌ Remove</button>
      `;
      listElement.appendChild(siteItem);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.remove-site').forEach(btn => {
      btn.addEventListener('click', function() {
        removeSite(this.getAttribute('data-site'));
      });
    });
  });
}

// Загрузка статистики
function loadStatistics() {
  chrome.storage.sync.get(['usageStats'], function(data) {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0, lastUsed: Date.now() };
    
    // Конвертируем минуты в часы
    const hours = Math.floor(stats.totalTimeUsed / 60);
    const minutes = stats.totalTimeUsed % 60;
    let timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    document.getElementById('total-time').textContent = timeStr;
    document.getElementById('total-switches').textContent = stats.themeSwitches || 0;
    
    // Форматируем дату последнего использования
    const lastUsed = new Date(stats.lastUsed);
    const now = new Date();
    const diffMs = now - lastUsed;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let lastUsedStr;
    if (diffDays === 0) {
      lastUsedStr = 'Today';
    } else if (diffDays === 1) {
      lastUsedStr = 'Yesterday';
    } else if (diffDays < 7) {
      lastUsedStr = `${diffDays} days ago`;
    } else {
      lastUsedStr = lastUsed.toLocaleDateString();
    }
    
    document.getElementById('last-used').textContent = lastUsedStr;
  });
}

// Установка обработчиков событий
function setupEventListeners() {
  // Сохранение CSS
  document.getElementById('save-css').addEventListener('click', saveCustomCSS);
  
  // Очистка CSS
  document.getElementById('clear-css').addEventListener('click', clearCustomCSS);
  
  // Сброс настроек
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Изменение языка
  document.getElementById('language-selector').addEventListener('click', changeLanguage);
  
  // Добавление сайта
  document.getElementById('add-site').addEventListener('click', addSite);
  
  // Экспорт настроек
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // Импорт настроек
  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-file').addEventListener('change', importSettings);
}

// Сохранение пользовательского CSS
function saveCustomCSS() {
  const customCSS = document.getElementById('custom-css-editor').value;
  chrome.storage.sync.set({ customCSS: customCSS }, function() {
    // Применяем CSS на всех вкладках
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "applyCustomCSS", 
          css: customCSS 
        }).catch(() => {});
      });
    });
    
    showToast('Custom CSS saved successfully!');
  });
}

// Очистка пользовательского CSS
function clearCustomCSS() {
  if (confirm('Are you sure you want to clear all custom CSS?')) {
    document.getElementById('custom-css-editor').value = '';
    chrome.storage.sync.set({ customCSS: '' }, function() {
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            action: "applyCustomCSS", 
            css: '' 
          }).catch(() => {});
        });
      });
      showToast('Custom CSS cleared!');
    });
  }
}

// Добавление сайта в список отключенных
function addSite() {
  const siteInput = document.getElementById('new-site');
  const site = siteInput.value.trim();
  
  if (!site) {
    showToast('Please enter a website URL', 'error');
    return;
  }
  
  chrome.storage.sync.get(['disabledSites'], function(data) {
    const sites = data.disabledSites || [];
    
    if (sites.includes(site)) {
      showToast('Site already in the list', 'error');
      return;
    }
    
    sites.push(site);
    chrome.storage.sync.set({ disabledSites: sites }, function() {
      siteInput.value = '';
      loadDisabledSites();
      showToast('Site added successfully!');
    });
  });
}

// Удаление сайта из списка отключенных
function removeSite(site) {
  chrome.storage.sync.get(['disabledSites'], function(data) {
    const sites = data.disabledSites || [];
    const index = sites.indexOf(site);
    
    if (index > -1) {
      sites.splice(index, 1);
      chrome.storage.sync.set({ disabledSites: sites }, function() {
        loadDisabledSites();
        showToast('Site removed successfully!');
      });
    }
  });
}

// Экспорт настроек
function exportSettings() {
  chrome.storage.sync.get(null, function(data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-helper-settings-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported successfully!');
  });
}

// Импорт настроек
function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const settings = JSON.parse(e.target.result);
      chrome.storage.sync.set(settings, function() {
        showToast('Settings imported successfully!');
        setTimeout(() => location.reload(), 1500);
      });
    } catch (error) {
      showToast('Invalid settings file!', 'error');
    }
  };
  reader.readAsText(file);
}

// Сброс настроек
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone!')) {
    chrome.storage.sync.clear(function() {
      // Устанавливаем значения по умолчанию
      chrome.storage.sync.set({
        fontSize: 0,
        boldText: false,
        selectedFont: 'Arial',
        darkMode: 'auto',
        darkModeIntensity: 85,
        blueLightFilter: false,
        blueLightIntensity: 50,
        focusMode: false,
        colorBlindMode: 'none',
        textToSpeech: true,
        speechVolume: 100,
        magnifierEnabled: true,
        showTimeNotification: true,
        currentTheme: 'light',
        customCSS: '',
        language: chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en',
        usageStats: {
          totalTimeUsed: 0,
          themeSwitches: 0,
          lastUsed: Date.now()
        }
      }, function() {
        showToast('Settings reset successfully!');
        setTimeout(() => location.reload(), 1500);
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
  const language = document.getElementById('language-selector').value;
  chrome.storage.sync.set({ language: language }, function() {
    updateTranslations(language);
    showToast('Language changed successfully!');
  });
}

// Показать уведомление (toast)
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)';
  } else {
    toast.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Временные функции переводов
function getEnglishTranslations() {
  return {
    "appName": "Vision Helper",
    "advancedSettings": "Advanced Settings",
    "general": "General",
    "customCSS": "Custom CSS",
    "siteManagement": "Site Management",
    "dataManagement": "Data Management",
    "keyboardShortcuts": "Keyboard Shortcuts",
    "toggleDarkMode": "Toggle Dark Mode",
    "increaseFontSize": "Increase Font Size",
    "decreaseFontSize": "Decrease Font Size",
    "statistics": "Usage Statistics",
    "totalActiveTime": "Total Active Time",
    "totalSwitches": "Theme Switches",
    "lastUsed": "Last Used",
    "resetSettings": "Reset Settings",
    "resetWarning": "Warning: This will restore all settings to their default values.",
    "resetToDefaults": "Reset to Defaults",
    "customCSSTitle": "Custom CSS Rules",
    "customCSSDescription": "Add your own CSS rules to further customize website appearance. Changes apply to all websites:",
    "save": "Save CSS",
    "clear": "Clear",
    "disabledSites": "Disabled Sites",
    "disabledSitesDescription": "The extension won't work on these websites:",
    "addSite": "Add Site",
    "exportSettings": "Export Settings",
    "exportDescription": "Export your current settings to a file for backup or transfer:",
    "exportBtn": "Export Settings",
    "importSettings": "Import Settings",
    "importDescription": "Import previously exported settings:",
    "importBtn": "Import Settings"
  };
}

function getRussianTranslations() {
  return {
    "appName": "Помощник зрения",
    "advancedSettings": "Дополнительные настройки",
    "general": "Общие",
    "customCSS": "Пользовательский CSS",
    "siteManagement": "Управление сайтами",
    "dataManagement": "Управление данными",
    "keyboardShortcuts": "Горячие клавиши",
    "toggleDarkMode": "Переключить тёмную тему",
    "increaseFontSize": "Увеличить размер шрифта",
    "decreaseFontSize": "Уменьшить размер шрифта",
    "statistics": "Статистика использования",
    "totalActiveTime": "Общее время активности",
    "totalSwitches": "Переключений темы",
    "lastUsed": "Последнее использование",
    "resetSettings": "Сброс настроек",
    "resetWarning": "Внимание: Это восстановит все настройки до значений по умолчанию.",
    "resetToDefaults": "Сбросить к умолчаниям",
    "customCSSTitle": "Пользовательские CSS правила",
    "customCSSDescription": "Добавьте свои CSS правила для дополнительной настройки внешнего вида веб-сайтов. Изменения применяются ко всем сайтам:",
    "save": "Сохранить CSS",
    "clear": "Очистить",
    "disabledSites": "Отключенные сайты",
    "disabledSitesDescription": "Расширение не будет работать на этих веб-сайтах:",
    "addSite": "Добавить сайт",
    "exportSettings": "Экспорт настроек",
    "exportDescription": "Экспортируйте текущие настройки в файл для резервного копирования или переноса:",
    "exportBtn": "Экспортировать настройки",
    "importSettings": "Импорт настроек",
    "importDescription": "Импортируйте ранее экспортированные настройки:",
    "importBtn": "Импортировать настройки"
  };
}