// Background service worker

const DEFAULT_SETTINGS = {
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
  readingRuler: false,
  breakReminder: false,
  breakInterval: 20,
  pageDimmer: false,
  pageDimmerIntensity: 30,
  highContrast: false,
  activePreset: 'none',
  extensionEnabled: true,
  disabledSites: [],
  customCSS: '',
  usageStats: {
    totalTimeUsed: 0,
    themeSwitches: 0,
    lastUsed: Date.now()
  }
};

// ==================== INSTALLATION ====================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First install - set all defaults
    const settings = { ...DEFAULT_SETTINGS };
    settings.language = chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en';
    chrome.storage.sync.set(settings);
  } else if (details.reason === 'update') {
    // Update - only set new keys that don't exist yet (preserve user settings)
    chrome.storage.sync.get(null, (existing) => {
      const newKeys = {};
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!(key in existing)) {
          newKeys[key] = value;
        }
      }
      if (Object.keys(newKeys).length > 0) {
        chrome.storage.sync.set(newKeys);
      }
    });
  }

  updateContextMenu();
  checkTimeForTheme();
  startBreakReminder();
  updateBadge();
});

// ==================== CONTEXT MENU ====================

function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.sync.get(['language', 'textToSpeech', 'magnifierEnabled'], (data) => {
      const isRu = data.language === 'ru';

      if (data.textToSpeech !== false) {
        chrome.contextMenus.create({
          id: "readText",
          title: isRu ? "Озвучить текст" : "Read text aloud",
          contexts: ["selection"]
        });
      }

      if (data.magnifierEnabled !== false) {
        chrome.contextMenus.create({
          id: "magnifyText",
          title: isRu ? "Увеличить текст" : "Magnify text",
          contexts: ["selection"]
        });
      }
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText" && info.selectionText) {
    chrome.storage.sync.get(['speechVolume'], (data) => {
      const lang = detectLanguage(info.selectionText);
      chrome.tts.speak(info.selectionText, {
        rate: 1.0,
        lang: lang,
        volume: data.speechVolume ? data.speechVolume / 100 : 1.0
      });
    });
  } else if (info.menuItemId === "magnifyText" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showMagnifier",
      text: info.selectionText
    }).catch(() => {});
  }
});

function detectLanguage(text) {
  const ruChars = (text.match(/[а-яА-ЯЁё]/g) || []).length;
  const enChars = (text.match(/[a-zA-Z]/g) || []).length;
  return ruChars > enChars ? 'ru-RU' : 'en-US';
}

// ==================== TIME-BASED THEME ====================

function checkTimeForTheme() {
  chrome.storage.sync.get(['darkMode', 'showTimeNotification', 'language'], (data) => {
    if (data.darkMode !== 'auto') return;

    const hours = new Date().getHours();
    const isNight = hours >= 20 || hours < 7;
    const newTheme = isNight ? 'dark' : 'light';

    chrome.storage.sync.set({ currentTheme: newTheme }, () => {
      // Notify all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "applyTheme",
            theme: newTheme
          }).catch(() => {});
        });
      });
    });

    // Show notification at transition times
    if (data.showTimeNotification) {
      const isRu = data.language === 'ru';
      if (isNight && hours === 20) {
        showNotification(isRu
          ? "Переключение на тёмную тему (20:00 - 7:00)"
          : "Switching to dark theme for night time (8 PM - 7 AM)");
      } else if (!isNight && hours === 7) {
        showNotification(isRu
          ? "Переключение на светлую тему (7:00 - 20:00)"
          : "Switching to light theme for daytime (7 AM - 8 PM)");
      }
    }
  });
}

// Check time every 5 minutes
setInterval(checkTimeForTheme, 300000);

function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'popup/images/icon48.png',
    title: 'Vision Helper',
    message: message
  });
}

// ==================== KEYBOARD COMMANDS ====================

chrome.commands.onCommand.addListener((command) => {
  const handlers = {
    'toggle-dark-mode': () => {
      chrome.storage.sync.get(['currentTheme'], (data) => {
        const newTheme = data.currentTheme === 'dark' ? 'light' : 'dark';
        chrome.storage.sync.set({ currentTheme: newTheme, darkMode: newTheme }, () => {
          notifyAllTabs({ action: "applyTheme", theme: newTheme });
          updateBadge();
        });
      });
    },
    'toggle-reading-ruler': () => {
      chrome.storage.sync.get(['readingRuler'], (data) => {
        const val = !data.readingRuler;
        chrome.storage.sync.set({ readingRuler: val }, () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "toggleReadingRuler", enabled: val
              }).catch(() => {});
            }
          });
          updateBadge();
        });
      });
    },
    'toggle-blue-light': () => {
      chrome.storage.sync.get(['blueLightFilter'], (data) => {
        const val = !data.blueLightFilter;
        chrome.storage.sync.set({ blueLightFilter: val }, () => {
          notifyAllTabs({ action: "applyStyles" });
          updateBadge();
        });
      });
    },
    'toggle-focus-mode': () => {
      chrome.storage.sync.get(['focusMode'], (data) => {
        const val = !data.focusMode;
        chrome.storage.sync.set({ focusMode: val }, () => {
          notifyAllTabs({ action: "applyStyles" });
          updateBadge();
        });
      });
    }
  };

  if (handlers[command]) handlers[command]();
});

function notifyAllTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {});
    });
  });
}

// ==================== BADGE ====================

function updateBadge() {
  chrome.storage.sync.get([
    'currentTheme', 'blueLightFilter', 'focusMode',
    'readingRuler', 'pageDimmer', 'highContrast', 'breakReminder'
  ], (data) => {
    let count = 0;
    if (data.currentTheme === 'dark') count++;
    if (data.blueLightFilter) count++;
    if (data.focusMode) count++;
    if (data.readingRuler) count++;
    if (data.pageDimmer) count++;
    if (data.highContrast) count++;
    if (data.breakReminder) count++;

    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#0d9373' });
  });
}

// ==================== BREAK REMINDER ====================

let breakReminderInterval = null;

function startBreakReminder() {
  if (breakReminderInterval) {
    clearInterval(breakReminderInterval);
    breakReminderInterval = null;
  }

  chrome.storage.sync.get(['breakReminder', 'breakInterval', 'language'], (data) => {
    if (!data.breakReminder) return;

    const intervalMs = (data.breakInterval || 20) * 60 * 1000;
    const isRu = data.language === 'ru';

    breakReminderInterval = setInterval(() => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'popup/images/icon48.png',
        title: isRu ? 'Время отдохнуть!' : 'Time for a break!',
        message: isRu
          ? 'Правило 20-20-20: Посмотрите на объект в 6 метрах в течение 20 секунд.'
          : '20-20-20 Rule: Look at something 20 feet (6 meters) away for 20 seconds.',
        priority: 2
      });
    }, intervalMs);
  });
}

// ==================== PRESETS ====================

function applyPreset(presetName) {
  if (presetName === 'reset') {
    // Reset to defaults (but keep language, stats, etc.)
    const resetSettings = {
      fontSize: 0,
      boldText: false,
      selectedFont: 'Arial',
      darkMode: 'auto',
      darkModeIntensity: 85,
      blueLightFilter: false,
      blueLightIntensity: 50,
      focusMode: false,
      readingRuler: false,
      pageDimmer: false,
      pageDimmerIntensity: 30,
      highContrast: false,
      activePreset: 'none'
    };
    chrome.storage.sync.set(resetSettings, () => {
      notifyAllTabs({ action: "applyStyles" });
      updateBadge();
      checkTimeForTheme();
    });
    return;
  }

  const presets = {
    reading: {
      fontSize: 3,
      darkMode: 'light',
      currentTheme: 'light',
      blueLightFilter: true,
      blueLightIntensity: 30,
      focusMode: false,
      readingRuler: true,
      pageDimmer: false,
      highContrast: false
    },
    night: {
      fontSize: 2,
      darkMode: 'dark',
      currentTheme: 'dark',
      darkModeIntensity: 85,
      blueLightFilter: true,
      blueLightIntensity: 70,
      focusMode: false,
      readingRuler: false,
      pageDimmer: true,
      pageDimmerIntensity: 40,
      highContrast: false
    },
    work: {
      fontSize: 1,
      darkMode: 'auto',
      blueLightFilter: true,
      blueLightIntensity: 40,
      focusMode: true,
      readingRuler: false,
      pageDimmer: false,
      highContrast: false
    },
    presentation: {
      fontSize: 5,
      darkMode: 'light',
      currentTheme: 'light',
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
      notifyAllTabs({ action: "applyStyles" });
      updateBadge();
      if (preset.darkMode === 'auto') checkTimeForTheme();
    });
  }
}

// ==================== MESSAGE HANDLER ====================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'applyPreset':
      applyPreset(request.preset);
      break;
    case 'updateBadge':
      updateBadge();
      break;
    case 'startBreakReminder':
      startBreakReminder();
      break;
    case 'updateContextMenu':
      updateContextMenu();
      break;
    case 'checkTimeForTheme':
      checkTimeForTheme();
      break;
  }
});

// ==================== STORAGE CHANGE LISTENER ====================

chrome.storage.onChanged.addListener((changes) => {
  if (changes.language || changes.textToSpeech || changes.magnifierEnabled) {
    updateContextMenu();
  }
  if (changes.breakReminder || changes.breakInterval) {
    startBreakReminder();
  }
  updateBadge();
});

// ==================== USAGE TRACKING ====================

// Track active time every minute
setInterval(() => {
  chrome.storage.sync.get(['usageStats', 'extensionEnabled'], (data) => {
    if (data.extensionEnabled === false) return;

    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0, lastUsed: Date.now() };
    stats.totalTimeUsed = (stats.totalTimeUsed || 0) + 1;
    stats.lastUsed = Date.now();
    chrome.storage.sync.set({ usageStats: stats });
  });
}, 60000);

// Initialize on startup
updateBadge();
startBreakReminder();
