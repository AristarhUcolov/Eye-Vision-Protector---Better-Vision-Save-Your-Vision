document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadSettings();
  initLanguage();
  loadStats();
  setupEventListeners();

  // Refresh stats every 30s
  setInterval(loadStats, 30000);
});

// ==================== TABS ====================

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

// ==================== STATS ====================

function loadStats() {
  chrome.storage.sync.get(['usageStats'], (data) => {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0 };
    const hours = Math.floor(stats.totalTimeUsed / 60);
    const minutes = stats.totalTimeUsed % 60;

    document.getElementById('active-time').textContent = hours > 0 ? `${hours}h` : `${minutes}m`;
    document.getElementById('theme-switches').textContent = stats.themeSwitches || 0;
  });

  updateActiveCount();
}

function updateActiveCount() {
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

    document.getElementById('active-features-count').textContent = count;
  });
}

// ==================== SETTINGS ====================

function loadSettings() {
  chrome.storage.sync.get([
    'fontSize', 'boldText', 'selectedFont',
    'darkMode', 'darkModeIntensity', 'blueLightFilter', 'blueLightIntensity',
    'colorBlindMode', 'textToSpeech', 'focusMode',
    'magnifierEnabled', 'showTimeNotification', 'language',
    'currentTheme', 'speechVolume', 'readingRuler', 'breakReminder',
    'breakInterval', 'pageDimmer', 'pageDimmerIntensity', 'highContrast',
    'activePreset', 'extensionEnabled'
  ], (data) => {
    // Extension master toggle
    const enabled = data.extensionEnabled !== false;
    document.getElementById('master-toggle').checked = enabled;
    if (!enabled) document.body.classList.add('extension-disabled');

    // Text
    document.getElementById('font-size').value = data.fontSize || 0;
    document.getElementById('font-size-value').textContent = '+' + (data.fontSize || 0);
    document.getElementById('bold-text').checked = data.boldText || false;
    document.getElementById('font-family').value = data.selectedFont || 'Arial';

    // Theme
    document.getElementById('dark-mode').value = data.darkMode || 'auto';
    document.getElementById('dark-mode-intensity').value = data.darkModeIntensity || 85;
    document.getElementById('dark-intensity-value').textContent = (data.darkModeIntensity || 85) + '%';

    // Blue light
    document.getElementById('blue-light-filter').checked = data.blueLightFilter || false;
    document.getElementById('blue-light-intensity').value = data.blueLightIntensity || 50;
    document.getElementById('blue-intensity-value').textContent = (data.blueLightIntensity || 50) + '%';

    // Color blind
    document.getElementById('color-blind-mode').value = data.colorBlindMode || 'none';

    // TTS
    document.getElementById('text-to-speech').checked = data.textToSpeech !== false;
    document.getElementById('speech-volume').value = data.speechVolume || 100;
    document.getElementById('speech-volume-value').textContent = (data.speechVolume || 100) + '%';

    // Toggles
    document.getElementById('focus-mode').checked = data.focusMode || false;
    document.getElementById('magnifier-enabled').checked = data.magnifierEnabled !== false;
    document.getElementById('show-time-notification').checked = data.showTimeNotification !== false;
    document.getElementById('reading-ruler').checked = data.readingRuler || false;
    document.getElementById('high-contrast').checked = data.highContrast || false;

    // Break reminder
    document.getElementById('break-reminder').checked = data.breakReminder || false;
    document.getElementById('break-interval').value = data.breakInterval || 20;
    document.getElementById('break-interval-value').textContent = (data.breakInterval || 20) + ' min';

    // Page dimmer
    document.getElementById('page-dimmer').checked = data.pageDimmer || false;
    document.getElementById('page-dimmer-intensity').value = data.pageDimmerIntensity || 30;
    document.getElementById('dimmer-intensity-value').textContent = (data.pageDimmerIntensity || 30) + '%';

    // Conditional visibility
    toggleExpand('dark-intensity-group', data.darkMode === 'dark' || data.darkMode === 'auto');
    toggleExpand('blue-light-intensity-group', data.blueLightFilter);
    toggleExpand('speech-volume-group', data.textToSpeech !== false);
    toggleExpand('page-dimmer-intensity-group', data.pageDimmer);
    toggleExpand('break-interval-group', data.breakReminder);

    // Active preset
    highlightPreset(data.activePreset);

    // Popup theme
    applyPopupTheme(data.currentTheme);
  });
}

function toggleExpand(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

function highlightPreset(name) {
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === name);
  });
}

function applyPopupTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

// ==================== LANGUAGE ====================

function initLanguage() {
  chrome.storage.sync.get(['language'], (data) => {
    const lang = data.language || (chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en');
    document.getElementById('language-selector').value = lang;
    applyTranslations(lang);
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  const $ = (id) => document.getElementById(id);

  // Master toggle
  $('master-toggle').addEventListener('change', function () {
    const enabled = this.checked;
    chrome.storage.sync.set({ extensionEnabled: enabled });
    if (enabled) {
      document.body.classList.remove('extension-disabled');
      applyChanges();
    } else {
      document.body.classList.add('extension-disabled');
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: "disableExtension" }).catch(() => {});
        });
      });
    }
  });

  // Quick theme toggle
  $('quick-toggle-theme').addEventListener('click', () => {
    chrome.storage.sync.get(['currentTheme'], (data) => {
      const newTheme = data.currentTheme === 'dark' ? 'light' : 'dark';
      chrome.storage.sync.set({ currentTheme: newTheme, darkMode: newTheme }, () => {
        updateThemeSwitchStats();
        applyThemeToAllTabs(newTheme);
        applyPopupTheme(newTheme);
        $('dark-mode').value = newTheme;
        toggleExpand('dark-intensity-group', newTheme === 'dark');
        updateActiveCount();
      });
    });
  });

  // Font size
  $('font-size').addEventListener('input', function () {
    $('font-size-value').textContent = '+' + this.value;
    chrome.storage.sync.set({ fontSize: parseInt(this.value) }, applyChanges);
  });

  // Bold text
  $('bold-text').addEventListener('change', function () {
    chrome.storage.sync.set({ boldText: this.checked }, applyChanges);
  });

  // Font family
  $('font-family').addEventListener('change', function () {
    chrome.storage.sync.set({ selectedFont: this.value }, applyChanges);
  });

  // Dark mode
  $('dark-mode').addEventListener('change', function () {
    const mode = this.value;
    toggleExpand('dark-intensity-group', mode === 'dark' || mode === 'auto');

    chrome.storage.sync.set({ darkMode: mode }, () => {
      if (mode === 'auto') {
        chrome.runtime.sendMessage({ action: "checkTimeForTheme" });
      } else {
        chrome.storage.sync.set({ currentTheme: mode }, () => {
          updateThemeSwitchStats();
          applyThemeToAllTabs(mode);
          applyPopupTheme(mode);
          updateActiveCount();
        });
      }
    });
  });

  // Dark mode intensity
  $('dark-mode-intensity').addEventListener('input', function () {
    $('dark-intensity-value').textContent = this.value + '%';
    chrome.storage.sync.set({ darkModeIntensity: parseInt(this.value) }, () => {
      // Re-apply theme so intensity change is visible immediately
      chrome.storage.sync.get(['currentTheme'], (data) => {
        if (data.currentTheme === 'dark') {
          applyThemeToAllTabs('dark');
        }
      });
    });
  });

  // Blue light filter
  $('blue-light-filter').addEventListener('change', function () {
    toggleExpand('blue-light-intensity-group', this.checked);
    chrome.storage.sync.set({ blueLightFilter: this.checked }, () => {
      applyChanges();
      updateActiveCount();
    });
  });

  // Blue light intensity
  $('blue-light-intensity').addEventListener('input', function () {
    $('blue-intensity-value').textContent = this.value + '%';
    chrome.storage.sync.set({ blueLightIntensity: parseInt(this.value) }, applyChanges);
  });

  // Focus mode
  $('focus-mode').addEventListener('change', function () {
    chrome.storage.sync.set({ focusMode: this.checked }, () => {
      applyChanges();
      updateActiveCount();
    });
  });

  // Color blind mode
  $('color-blind-mode').addEventListener('change', function () {
    chrome.storage.sync.set({ colorBlindMode: this.value }, applyChanges);
  });

  // Text-to-Speech
  $('text-to-speech').addEventListener('change', function () {
    toggleExpand('speech-volume-group', this.checked);
    chrome.storage.sync.set({ textToSpeech: this.checked }, () => {
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
  });

  // Speech volume
  $('speech-volume').addEventListener('input', function () {
    $('speech-volume-value').textContent = this.value + '%';
    chrome.storage.sync.set({ speechVolume: parseInt(this.value) });
  });

  // Magnifier
  $('magnifier-enabled').addEventListener('change', function () {
    chrome.storage.sync.set({ magnifierEnabled: this.checked }, () => {
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
  });

  // Notifications
  $('show-time-notification').addEventListener('change', function () {
    chrome.storage.sync.set({ showTimeNotification: this.checked });
  });

  // Reading ruler
  $('reading-ruler').addEventListener('change', function () {
    chrome.storage.sync.set({ readingRuler: this.checked }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "toggleReadingRuler",
            enabled: this.checked
          }).catch(() => {});
        }
      });
      chrome.runtime.sendMessage({ action: "updateBadge" });
      updateActiveCount();
    });
  });

  // High contrast
  $('high-contrast').addEventListener('change', function () {
    chrome.storage.sync.set({ highContrast: this.checked }, () => {
      applyChanges();
      chrome.runtime.sendMessage({ action: "updateBadge" });
      updateActiveCount();
    });
  });

  // Break reminder
  $('break-reminder').addEventListener('change', function () {
    toggleExpand('break-interval-group', this.checked);
    chrome.storage.sync.set({ breakReminder: this.checked }, () => {
      chrome.runtime.sendMessage({ action: "startBreakReminder" });
      updateActiveCount();
    });
  });

  // Break interval
  $('break-interval').addEventListener('input', function () {
    $('break-interval-value').textContent = this.value + ' min';
    chrome.storage.sync.set({ breakInterval: parseInt(this.value) }, () => {
      chrome.runtime.sendMessage({ action: "startBreakReminder" });
    });
  });

  // Page dimmer
  $('page-dimmer').addEventListener('change', function () {
    toggleExpand('page-dimmer-intensity-group', this.checked);
    chrome.storage.sync.set({ pageDimmer: this.checked }, () => {
      applyChanges();
      chrome.runtime.sendMessage({ action: "updateBadge" });
      updateActiveCount();
    });
  });

  // Page dimmer intensity
  $('page-dimmer-intensity').addEventListener('input', function () {
    $('dimmer-intensity-value').textContent = this.value + '%';
    chrome.storage.sync.set({ pageDimmerIntensity: parseInt(this.value) }, applyChanges);
  });

  // Presets
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', function () {
      const preset = this.dataset.preset;

      if (preset === 'reset') {
        chrome.runtime.sendMessage({ action: "applyPreset", preset: "reset" });
      } else {
        chrome.runtime.sendMessage({ action: "applyPreset", preset: preset });
      }

      highlightPreset(preset === 'reset' ? 'none' : preset);

      // Reload settings after preset applied
      setTimeout(() => {
        loadSettings();
        loadStats();
      }, 300);
    });
  });

  // Donate
  $('buy-me-coffee').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://buymeacoffee.com/aristarh.ucolov' });
  });

  // Options page
  $('options-button').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Language
  $('language-selector').addEventListener('change', function () {
    const lang = this.value;
    chrome.storage.sync.set({ language: lang }, () => {
      applyTranslations(lang);
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    });
  });
}

// ==================== HELPERS ====================

function updateThemeSwitchStats() {
  chrome.storage.sync.get(['usageStats'], (data) => {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0, lastUsed: Date.now() };
    stats.themeSwitches = (stats.themeSwitches || 0) + 1;
    stats.lastUsed = Date.now();
    chrome.storage.sync.set({ usageStats: stats });
    loadStats();
  });
}

function applyChanges() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: "applyStyles" }).catch(() => {});
    });
  });
}

function applyThemeToAllTabs(theme) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: "applyTheme", theme: theme }).catch(() => {});
    });
  });
}
