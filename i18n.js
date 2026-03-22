// Shared internationalization module
const I18N = {
  en: {
    appName: "Vision Helper",
    activeTime: "Active",
    switches: "Switches",
    activeLabel: "active",

    // Tabs
    tabProtection: "Protection",
    tabReading: "Reading",
    tabTools: "Tools",

    // Presets
    presetReading: "Reading",
    presetNight: "Night",
    presetWork: "Work",
    presetPresentation: "Present.",
    presetReset: "Reset",

    // Protection
    colorTheme: "Color Theme",
    auto: "Auto",
    lightTheme: "Light",
    darkTheme: "Dark",
    darkIntensity: "Intensity",
    blueLightFilter: "Blue Light Filter",
    blueIntensity: "Warmth",
    pageDimmer: "Page Dimmer",
    dimmerIntensity: "Dimness",
    breakReminder: "Break Reminder",
    breakInterval: "Interval",

    // Reading
    fontSize: "Font Size",
    standard: "Standard",
    fontFamily: "Font Family",
    boldText: "Bold Text",
    readingRuler: "Reading Ruler",
    highContrast: "High Contrast",

    // Tools
    focusMode: "Focus Mode",
    focusModeDesc: "Dims distracting page elements",
    colorBlindMode: "Color Blind Mode",
    none: "None",
    protanopia: "Protanopia (red-blind)",
    deuteranopia: "Deuteranopia (green-blind)",
    tritanopia: "Tritanopia (blue-blind)",
    achromatopsia: "Achromatopsia (total color blindness)",
    enableTextToSpeech: "Text-to-Speech",
    speechVolume: "Volume",
    enableMagnifier: "Text Magnifier",
    magnifierDesc: "Right-click selected text to magnify",
    showTimeNotifications: "Notifications",

    // Footer
    advancedSettings: "Advanced Settings",
    supportProject: "Support Project",
    donateMessage: "If you find this extension helpful, consider supporting its development!",
    buyMeCoffee: "Buy Me a Coffee",
    bankTransfer: "Bank Transfer",

    // Options page
    general: "General",
    customCSS: "Custom CSS",
    siteManagement: "Site Management",
    dataManagement: "Data Management",
    keyboardShortcuts: "Keyboard Shortcuts",
    toggleDarkMode: "Toggle Dark Mode",
    toggleReadingRuler: "Toggle Reading Ruler",
    toggleBlueLight: "Toggle Blue Light Filter",
    toggleFocusMode: "Toggle Focus Mode",
    statistics: "Usage Statistics",
    totalActiveTime: "Total Active Time",
    totalSwitches: "Theme Switches",
    lastUsed: "Last Used",
    resetSettings: "Reset Settings",
    resetWarning: "Warning: This will restore all settings to their default values.",
    resetToDefaults: "Reset to Defaults",
    customCSSTitle: "Custom CSS Rules",
    customCSSDescription: "Add your own CSS rules to customize website appearance:",
    save: "Save CSS",
    clear: "Clear",
    disabledSites: "Disabled Sites",
    disabledSitesDescription: "The extension won't work on these websites:",
    addSite: "Add Site",
    exportSettings: "Export Settings",
    exportDescription: "Export your current settings to a file for backup or transfer:",
    exportBtn: "Export Settings",
    importSettings: "Import Settings",
    importDescription: "Import previously exported settings:",
    importBtn: "Import Settings",

    // Notifications
    breakTitle: "Time for a break!",
    breakMessage: "20-20-20 Rule: Look at something 20 feet (6 meters) away for 20 seconds.",
    darkThemeNotif: "Switching to dark theme for night time (8 PM - 7 AM)",
    lightThemeNotif: "Switching to light theme for daytime (7 AM - 8 PM)",

    // Context menu
    readTextAloud: "Read text aloud",
    magnifyText: "Magnify text",

    // Toast messages
    cssSaved: "Custom CSS saved!",
    cssCleared: "Custom CSS cleared!",
    siteAdded: "Site added!",
    siteRemoved: "Site removed!",
    settingsExported: "Settings exported!",
    settingsImported: "Settings imported!",
    settingsReset: "Settings reset!",
    languageChanged: "Language changed!",
    enterSiteUrl: "Please enter a website URL",
    siteExists: "Site already in the list",
    invalidFile: "Invalid settings file!"
  },

  ru: {
    appName: "Помощник зрения",
    activeTime: "Активен",
    switches: "Переключ.",
    activeLabel: "активно",

    tabProtection: "Защита",
    tabReading: "Чтение",
    tabTools: "Инструменты",

    presetReading: "Чтение",
    presetNight: "Ночь",
    presetWork: "Работа",
    presetPresentation: "Презент.",
    presetReset: "Сброс",

    colorTheme: "Цветовая тема",
    auto: "Авто",
    lightTheme: "Светлая",
    darkTheme: "Тёмная",
    darkIntensity: "Интенсивность",
    blueLightFilter: "Фильтр синего света",
    blueIntensity: "Теплота",
    pageDimmer: "Затемнение страницы",
    dimmerIntensity: "Затемнение",
    breakReminder: "Напоминание о перерыве",
    breakInterval: "Интервал",

    fontSize: "Размер шрифта",
    standard: "Стандарт",
    fontFamily: "Шрифт",
    boldText: "Жирный текст",
    readingRuler: "Линейка для чтения",
    highContrast: "Высокая контрастность",

    focusMode: "Режим фокуса",
    focusModeDesc: "Затемняет отвлекающие элементы",
    colorBlindMode: "Режим для дальтоников",
    none: "Нет",
    protanopia: "Протанопия (не видят красный)",
    deuteranopia: "Дейтеранопия (не видят зелёный)",
    tritanopia: "Тританопия (не видят синий)",
    achromatopsia: "Ахроматопсия (полная цветовая слепота)",
    enableTextToSpeech: "Озвучивание текста",
    speechVolume: "Громкость",
    enableMagnifier: "Лупа для текста",
    magnifierDesc: "ПКМ по выделенному тексту для увеличения",
    showTimeNotifications: "Уведомления",

    advancedSettings: "Дополнительные настройки",
    supportProject: "Поддержать проект",
    donateMessage: "Если расширение помогает вам, поддержите его разработку!",
    buyMeCoffee: "Купить мне кофе",
    bankTransfer: "Банковский перевод",

    general: "Общие",
    customCSS: "Пользовательский CSS",
    siteManagement: "Управление сайтами",
    dataManagement: "Управление данными",
    keyboardShortcuts: "Горячие клавиши",
    toggleDarkMode: "Переключить тёмную тему",
    toggleReadingRuler: "Переключить линейку",
    toggleBlueLight: "Переключить фильтр синего",
    toggleFocusMode: "Переключить режим фокуса",
    statistics: "Статистика использования",
    totalActiveTime: "Общее время активности",
    totalSwitches: "Переключений темы",
    lastUsed: "Последнее использование",
    resetSettings: "Сброс настроек",
    resetWarning: "Внимание: Это восстановит все настройки до значений по умолчанию.",
    resetToDefaults: "Сбросить к умолчаниям",
    customCSSTitle: "Пользовательские CSS правила",
    customCSSDescription: "Добавьте свои CSS правила для настройки внешнего вида сайтов:",
    save: "Сохранить CSS",
    clear: "Очистить",
    disabledSites: "Отключенные сайты",
    disabledSitesDescription: "Расширение не будет работать на этих сайтах:",
    addSite: "Добавить сайт",
    exportSettings: "Экспорт настроек",
    exportDescription: "Экспортируйте настройки в файл для бэкапа или переноса:",
    exportBtn: "Экспортировать настройки",
    importSettings: "Импорт настроек",
    importDescription: "Импортируйте ранее экспортированные настройки:",
    importBtn: "Импортировать настройки",

    breakTitle: "Время отдохнуть!",
    breakMessage: "Правило 20-20-20: Посмотрите на объект в 6 метрах в течение 20 секунд.",
    darkThemeNotif: "Переключение на тёмную тему (20:00 - 7:00)",
    lightThemeNotif: "Переключение на светлую тему (7:00 - 20:00)",

    readTextAloud: "Озвучить текст",
    magnifyText: "Увеличить текст",

    cssSaved: "CSS сохранён!",
    cssCleared: "CSS очищен!",
    siteAdded: "Сайт добавлен!",
    siteRemoved: "Сайт удалён!",
    settingsExported: "Настройки экспортированы!",
    settingsImported: "Настройки импортированы!",
    settingsReset: "Настройки сброшены!",
    languageChanged: "Язык изменён!",
    enterSiteUrl: "Введите URL сайта",
    siteExists: "Сайт уже в списке",
    invalidFile: "Неверный файл настроек!"
  }
};

// Get translation for a key
function t(key, lang) {
  if (!lang) {
    // Try to detect from storage or fall back to 'en'
    lang = document.documentElement.getAttribute('data-lang') || 'en';
  }
  const messages = I18N[lang] || I18N.en;
  return messages[key] || I18N.en[key] || key;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  const messages = I18N[lang] || I18N.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = messages[key] || I18N.en[key];
    if (text) {
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = text;
      } else {
        el.textContent = text;
      }
    }
  });
}
