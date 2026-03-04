// Фоновый скрипт для управления расширением
chrome.runtime.onInstalled.addListener(() => {
  // Установка значений по умолчанию
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
    language: chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en',
    // New features
    readingRuler: false,
    breakReminder: false,
    breakInterval: 20, // minutes
    pageDimmer: false,
    pageDimmerIntensity: 30,
    highContrast: false,
    activePreset: 'none',
    usageStats: {
      totalTimeUsed: 0,
      themeSwitches: 0,
      lastUsed: Date.now()
    }
  });

  // Создание контекстного меню
  updateContextMenu();
  
  // Проверка времени для темы
  checkTimeForTheme();
  
  // Установка интервала для проверки времени каждые 5 минут
  setInterval(checkTimeForTheme, 300000);
});

// Обновление контекстного меню
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get(['language', 'textToSpeech', 'magnifierEnabled'], function(data) {
      const isRussian = data.language === 'ru';
      
      chrome.contextMenus.create({
        id: "readText",
        title: isRussian ? "Озвучить текст" : "Read text aloud",
        contexts: ["selection"],
        enabled: data.textToSpeech
      });

      chrome.contextMenus.create({
        id: "magnifyText",
        title: isRussian ? "Увеличить текст" : "Magnify text",
        contexts: ["selection"],
        enabled: data.magnifierEnabled
      });
    });
  });
}

// Обработчик контекстного меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText") {
    chrome.storage.sync.get(['textToSpeech', 'speechVolume'], function(data) {
      if (data.textToSpeech && info.selectionText) {
        const lang = detectLanguage(info.selectionText);
        chrome.tts.speak(info.selectionText, {
          rate: 1.0,
          lang: lang,
          volume: data.speechVolume ? data.speechVolume / 100 : 1.0
        });
      }
    });
  } else if (info.menuItemId === "magnifyText") {
    chrome.storage.sync.get(['magnifierEnabled'], function(data) {
      if (data.magnifierEnabled && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          action: "showMagnifier",
          text: info.selectionText
        });
      }
    });
  }
});

// Функция определения языка текста
function detectLanguage(text) {
  const russianChars = text.match(/[а-яА-ЯЁё]/g);
  const englishChars = text.match(/[a-zA-Z]/g);
  
  if (russianChars && russianChars.length > (englishChars ? englishChars.length : 0)) {
    return 'ru-RU';
  }
  return 'en-US';
}

// Проверка времени для автоматического переключения темы
function checkTimeForTheme() {
  chrome.storage.sync.get(['darkMode', 'showTimeNotification', 'language'], (data) => {
    if (data.darkMode === 'auto') {
      const hours = new Date().getHours();
      const isNightTime = hours >= 20 || hours < 7;
      
      chrome.storage.sync.set({ currentTheme: isNightTime ? 'dark' : 'light' }, () => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: "applyTheme",
              theme: isNightTime ? 'dark' : 'light'
            });
          });
        });
      });

      // Показ уведомления о смене темы
      if (data.showTimeNotification) {
        if (isNightTime && hours === 20) {
          showNotification(data.language === 'ru' ? 
            "Переключение на тёмную тему для ночного времени (20:00 - 7:00)" : 
            "Switching to dark theme for night time (8 PM - 7 AM)");
        } else if (!isNightTime && hours === 7) {
          showNotification(data.language === 'ru' ?
            "Переключение на светлую тему для дневного времени (7:00 - 20:00)" :
            "Switching to light theme for daytime (7 AM - 8 PM)");
        }
      }
    }
  });
}

// Показать уведомление
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'popup/images/icon48.png',
    title: chrome.i18n.getMessage("appName"),
    message: message
  });
}

// Обработчик изменения настроек
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.language || changes.textToSpeech || changes.magnifierEnabled) {
    updateContextMenu();
  }
});

// Обработчик команд с клавиатуры
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-dark-mode') {
    chrome.storage.sync.get(['darkMode', 'currentTheme'], (data) => {
      const newTheme = data.currentTheme === 'dark' ? 'light' : 'dark';
      chrome.storage.sync.set({ currentTheme: newTheme }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "applyTheme",
              theme: newTheme
            });
          }
        });
        updateBadge();
      });
    });
  } else if (command === 'toggle-reading-ruler') {
    chrome.storage.sync.get(['readingRuler'], (data) => {
      const newValue = !data.readingRuler;
      chrome.storage.sync.set({ readingRuler: newValue }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "toggleReadingRuler",
              enabled: newValue
            });
          }
        });
        updateBadge();
      });
    });
  } else if (command === 'toggle-blue-light') {
    chrome.storage.sync.get(['blueLightFilter'], (data) => {
      const newValue = !data.blueLightFilter;
      chrome.storage.sync.set({ blueLightFilter: newValue }, () => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "applyStyles" });
          });
        });
        updateBadge();
      });
    });
  } else if (command === 'toggle-focus-mode') {
    chrome.storage.sync.get(['focusMode'], (data) => {
      const newValue = !data.focusMode;
      chrome.storage.sync.set({ focusMode: newValue }, () => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "applyStyles" });
          });
        });
        updateBadge();
      });
    });
  }
});

// Update badge with active filters count
function updateBadge() {
  chrome.storage.sync.get([
    'currentTheme', 'blueLightFilter', 'focusMode', 
    'readingRuler', 'pageDimmer', 'highContrast'
  ], (data) => {
    let count = 0;
    if (data.currentTheme === 'dark') count++;
    if (data.blueLightFilter) count++;
    if (data.focusMode) count++;
    if (data.readingRuler) count++;
    if (data.pageDimmer) count++;
    if (data.highContrast) count++;
    
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Break reminder system
let breakReminderInterval = null;

function startBreakReminder() {
  chrome.storage.sync.get(['breakReminder', 'breakInterval', 'language'], (data) => {
    if (breakReminderInterval) {
      clearInterval(breakReminderInterval);
      breakReminderInterval = null;
    }
    
    if (data.breakReminder) {
      const intervalMs = (data.breakInterval || 20) * 60 * 1000;
      
      breakReminderInterval = setInterval(() => {
        const isRussian = data.language === 'ru';
        const title = isRussian ? '⏰ Время отдохнуть!' : '⏰ Time for a break!';
        const message = isRussian 
          ? 'Правило 20-20-20: Посмотрите на объект в 20 футах (6 метров) в течение 20 секунд.' 
          : '20-20-20 Rule: Look at something 20 feet (6 meters) away for 20 seconds.';
        
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'popup/images/icon48.png',
          title: title,
          message: message,
          priority: 2
        });
      }, intervalMs);
    }
  });
}

// Apply preset configurations
function applyPreset(presetName) {
  const presets = {
    'reading': {
      fontSize: 3,
      darkMode: 'light',
      blueLightFilter: true,
      blueLightIntensity: 30,
      focusMode: false,
      readingRuler: true,
      pageDimmer: false,
      highContrast: false
    },
    'night': {
      fontSize: 2,
      darkMode: 'dark',
      darkModeIntensity: 90,
      blueLightFilter: true,
      blueLightIntensity: 70,
      focusMode: false,
      readingRuler: false,
      pageDimmer: true,
      pageDimmerIntensity: 40,
      highContrast: false
    },
    'work': {
      fontSize: 1,
      darkMode: 'auto',
      blueLightFilter: true,
      blueLightIntensity: 40,
      focusMode: true,
      readingRuler: false,
      pageDimmer: false,
      highContrast: false
    },
    'presentation': {
      fontSize: 5,
      darkMode: 'light',
      blueLightFilter: false,
      focusMode: false,
      readingRuler: false,
      pageDimmer: false,
      highContrast: true
    }
  };
  
  const preset = presets[presetName];
  if (preset) {
    preset.activePreset = presetName;
    chrome.storage.sync.set(preset, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: "applyStyles" });
        });
      });
      updateBadge();
      checkTimeForTheme();
    });
  }
}

// Listen for preset messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyPreset") {
    applyPreset(request.preset);
  } else if (request.action === "updateBadge") {
    updateBadge();
  } else if (request.action === "startBreakReminder") {
    startBreakReminder();
  }
});

// Initialize badge and break reminder
updateBadge();
startBreakReminder();

// Update on storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.breakReminder || changes.breakInterval) {
    startBreakReminder();
  }
  updateBadge();
});