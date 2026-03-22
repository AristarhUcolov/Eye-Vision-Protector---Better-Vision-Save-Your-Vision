document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadCustomCSS();
  loadDisabledSites();
  loadStatistics();
  initLanguage();
  setupEventListeners();
});

// ==================== TABS ====================

function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// ==================== LANGUAGE ====================

function initLanguage() {
  chrome.storage.sync.get(['language'], (data) => {
    const lang = data.language || (chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en');
    document.getElementById('language-selector').value = lang;
    applyTranslations(lang);
    document.title = t('appName', lang) + ' - ' + t('advancedSettings', lang);
  });
}

// ==================== DATA LOADING ====================

function loadCustomCSS() {
  chrome.storage.sync.get(['customCSS'], (data) => {
    if (data.customCSS) {
      document.getElementById('custom-css-editor').value = data.customCSS;
    }
  });
}

function loadDisabledSites() {
  chrome.storage.sync.get(['disabledSites'], (data) => {
    const sites = data.disabledSites || [];
    const list = document.getElementById('disabled-sites-list');

    if (sites.length === 0) {
      list.innerHTML = '<div class="empty-state"><span>No disabled sites yet</span></div>';
      return;
    }

    list.innerHTML = '';
    sites.forEach(site => {
      const item = document.createElement('div');
      item.className = 'site-item';
      item.innerHTML = `
        <span>${escapeHtml(site)}</span>
        <button class="remove-site" data-site="${escapeHtml(site)}">Remove</button>
      `;
      list.appendChild(item);
    });

    document.querySelectorAll('.remove-site').forEach(btn => {
      btn.addEventListener('click', function () {
        removeSite(this.dataset.site);
      });
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function loadStatistics() {
  chrome.storage.sync.get(['usageStats'], (data) => {
    const stats = data.usageStats || { totalTimeUsed: 0, themeSwitches: 0, lastUsed: Date.now() };

    const hours = Math.floor(stats.totalTimeUsed / 60);
    const minutes = stats.totalTimeUsed % 60;
    document.getElementById('total-time').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    document.getElementById('total-switches').textContent = stats.themeSwitches || 0;

    const lastUsed = new Date(stats.lastUsed);
    const diffDays = Math.floor((Date.now() - lastUsed) / (1000 * 60 * 60 * 24));

    let lastUsedStr;
    if (diffDays === 0) lastUsedStr = 'Today';
    else if (diffDays === 1) lastUsedStr = 'Yesterday';
    else if (diffDays < 7) lastUsedStr = `${diffDays} days ago`;
    else lastUsedStr = lastUsed.toLocaleDateString();

    document.getElementById('last-used').textContent = lastUsedStr;
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  document.getElementById('save-css').addEventListener('click', saveCustomCSS);
  document.getElementById('clear-css').addEventListener('click', clearCustomCSS);
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  document.getElementById('add-site').addEventListener('click', addSite);
  document.getElementById('export-settings').addEventListener('click', exportSettings);

  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', importSettings);

  // Fixed: use 'change' instead of 'click'
  document.getElementById('language-selector').addEventListener('change', function () {
    const lang = this.value;
    chrome.storage.sync.set({ language: lang }, () => {
      applyTranslations(lang);
      document.title = t('appName', lang) + ' - ' + t('advancedSettings', lang);
      showToast(t('languageChanged', lang));
    });
  });

  // Enter key to add site
  document.getElementById('new-site').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite();
  });
}

// ==================== ACTIONS ====================

function saveCustomCSS() {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const css = document.getElementById('custom-css-editor').value;

  chrome.storage.sync.set({ customCSS: css }, () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: "applyCustomCSS",
          css: css
        }).catch(() => {});
      });
    });
    showToast(t('cssSaved', lang));
  });
}

function clearCustomCSS() {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';

  if (confirm(lang === 'ru' ? 'Очистить весь CSS?' : 'Clear all custom CSS?')) {
    document.getElementById('custom-css-editor').value = '';
    chrome.storage.sync.set({ customCSS: '' }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "applyCustomCSS",
            css: ''
          }).catch(() => {});
        });
      });
      showToast(t('cssCleared', lang));
    });
  }
}

function addSite() {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const input = document.getElementById('new-site');
  const site = input.value.trim().toLowerCase();

  if (!site) {
    showToast(t('enterSiteUrl', lang), 'error');
    return;
  }

  chrome.storage.sync.get(['disabledSites'], (data) => {
    const sites = data.disabledSites || [];

    if (sites.includes(site)) {
      showToast(t('siteExists', lang), 'error');
      return;
    }

    sites.push(site);
    chrome.storage.sync.set({ disabledSites: sites }, () => {
      input.value = '';
      loadDisabledSites();
      showToast(t('siteAdded', lang));
    });
  });
}

function removeSite(site) {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';

  chrome.storage.sync.get(['disabledSites'], (data) => {
    const sites = data.disabledSites || [];
    const idx = sites.indexOf(site);

    if (idx > -1) {
      sites.splice(idx, 1);
      chrome.storage.sync.set({ disabledSites: sites }, () => {
        loadDisabledSites();
        showToast(t('siteRemoved', lang));
      });
    }
  });
}

function exportSettings() {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';

  chrome.storage.sync.get(null, (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-helper-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(t('settingsExported', lang));
  });
}

function importSettings(event) {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const settings = JSON.parse(e.target.result);
      chrome.storage.sync.set(settings, () => {
        showToast(t('settingsImported', lang));
        setTimeout(() => location.reload(), 1500);
      });
    } catch {
      showToast(t('invalidFile', lang), 'error');
    }
  };
  reader.readAsText(file);
}

function resetSettings() {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const msg = lang === 'ru'
    ? 'Вы уверены что хотите сбросить все настройки?'
    : 'Are you sure you want to reset all settings to defaults?';

  if (confirm(msg)) {
    chrome.storage.sync.clear(() => {
      const defaults = {
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
        extensionEnabled: true,
        readingRuler: false,
        breakReminder: false,
        breakInterval: 20,
        pageDimmer: false,
        pageDimmerIntensity: 30,
        highContrast: false,
        activePreset: 'none',
        disabledSites: [],
        language: chrome.i18n.getUILanguage().startsWith('ru') ? 'ru' : 'en',
        usageStats: {
          totalTimeUsed: 0,
          themeSwitches: 0,
          lastUsed: Date.now()
        }
      };

      chrome.storage.sync.set(defaults, () => {
        showToast(t('settingsReset', lang));
        setTimeout(() => location.reload(), 1500);
      });
    });
  }
}

// ==================== TOAST ====================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';

  if (type === 'error') {
    toast.style.background = '#1a1a1f';
    toast.style.borderLeftColor = '#dc4545';
  } else {
    toast.style.background = '#1a1a1f';
    toast.style.borderLeftColor = '#0d9373';
  }

  setTimeout(() => toast.classList.remove('show'), 3000);
}
