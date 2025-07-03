// Фоновый скрипт для управления расширением
chrome.runtime.onInstalled.addListener(() => {
  // Установка значений по умолчанию
  chrome.storage.sync.set({
    fontSize: 0,
    boldText: false,
    selectedFont: 'Arial',
    darkMode: 'auto',
    colorBlindMode: 'none',
    textToSpeech: true,
    speechVolume: 100,
    magnifierEnabled: true,
    showTimeNotification: true,
    currentTheme: 'light',
    language: chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en'
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
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "applyTheme",
            theme: newTheme
          });
        });
      });
    });
  }
});