# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-04

### 🚀 Major Feature Update

Expanding accessibility with new productivity and health features!

### ✨ Added
- **Reading Ruler** - Horizontal guide bar that follows your cursor to help maintain reading focus
  - Toggle with checkbox or keyboard shortcut (Ctrl+Shift+R)
  - Smooth animation and adjustable position
  - Perfect for people with dyslexia or reading difficulties

- **Break Reminder System** - Automated reminders following the 20-20-20 rule
  - Customizable interval (10-60 minutes)
  - Notifications to remind you to rest your eyes
  - Helps prevent digital eye strain
  
- **Page Dimmer** - Global page brightness control
  - Adjustable intensity (0-80%)
  - Reduces overall screen brightness without affecting contrast
  - Great for late-night browsing
  
- **High Contrast Mode** - Maximizes readability for low vision users
  - Forces high contrast colors across all websites
  - Removes shadows and transparency effects
  - Compliant with WCAG accessibility standards
  
- **Quick Presets** - One-click configuration profiles
  - 📖 **Reading** - Optimized for long reading sessions
  - 🌙 **Night** - Maximum eye protection for evening use
  - 💼 **Work** - Balanced settings for productivity
  - 🎥 **Presentation** - High visibility for presentations
  - Visual indicator shows active preset
  
- **Keyboard Shortcuts** - Enhanced keyboard control
  - Ctrl+Shift+D - Toggle dark mode
  - Ctrl+Shift+R - Toggle reading ruler
  - Ctrl+Shift+B - Toggle blue light filter
  - Ctrl+Shift+F - Toggle focus mode
  - Customizable in browser settings
  
- **Badge Indicator** - Extension icon shows count of active filters
  - Quick visual feedback without opening popup
  - Purple badge with number of enabled features
  - Auto-updates when settings change

### 🎨 Improved
- **UI Organization** - Added Quick Presets section at the top of popup
- **Performance** - Optimized filter application and style updates
- **Context Menu** - Better integration with browser context menus
- **Error Handling** - Added robust error handling for all new features

### 🔧 Technical
- Added `readingRuler`, `breakReminder`, `pageDimmer`, `highContrast` settings
- Implemented badge update system in background worker
- Added preset configuration system with 4 default profiles
- Enhanced keyboard command handling
- Improved storage management for new settings

### 📚 Documentation
- Updated all translations (EN/RU) for new features
- Added tooltips and descriptions
- Enhanced keyboard shortcuts documentation

## [1.0.0] - 2026-02-01

### 🎉 Major Release

This is the first major stable release with significant improvements and new features!

### ✨ Added
- **Blue Light Filter** - New filter to reduce harmful blue light with adjustable intensity (0-100%)
- **Focus Mode** - Dim distracting elements while highlighting active content
- **Dark Mode Intensity Control** - Adjust dark theme intensity from 50% to 100%
- **Usage Statistics** - Track active time, theme switches, and last usage
- **Site Management** - Disable extension on specific websites
- **Export/Import Settings** - Backup and restore your preferences
- **Modern UI/UX** - Completely redesigned popup with gradient backgrounds and smooth animations
- **Advanced Options Page** - New tabbed interface with statistics, CSS editor, site management, and data controls
- **Toast Notifications** - Better user feedback with stylish toast messages
- **Quick Theme Toggle** - Button in popup for instant theme switching

### 🔧 Fixed
- **Dark Mode Issues** - Complete rewrite using smart inversion filter
  - Now preserves images, videos, and canvas elements correctly
  - No more unwanted color changes on websites
  - Better compatibility with modern web designs
- **Speech Volume** - Fixed volume slider not working properly
- **Theme Persistence** - Improved theme state management across tabs
- **Performance** - Optimized style application and reduced memory usage

### 🎨 Improved
- **UI Design** - Modern gradient backgrounds, better typography, smoother transitions
- **Color Scheme** - Purple gradient theme (#667eea to #764ba2) throughout
- **Toggle Switches** - Replaced checkboxes with modern toggle switches
- **Slider Design** - Enhanced range sliders with gradient tracks
- **Popup Width** - Increased from 350px to 400px for better layout
- **Icon Integration** - Added emoji icons to all sections for better visual navigation
- **Responsive Design** - Better scaling and layout on different screen sizes

### 📝 Changed
- Updated manifest version to 1.0.0
- Improved extension description
- Enhanced README with comprehensive documentation
- Better code organization and comments
- Optimized CSS delivery

### 🗑️ Removed
- Old checkbox styling (replaced with toggles)
- Obsolete site-specific theme fixes (no longer needed with new dark mode)
- Redundant CSS rules

### 🛠️ Technical
- Manifest V3 compliance maintained
- Improved error handling
- Better async/await usage
- Enhanced storage management
- Optimized content script injection

---

## [0.0.1] - Previous Version

### Initial Features
- Basic font size adjustment
- Font family selection
- Bold text mode
- Basic dark mode (with issues)
- Color blind modes (4 types)
- Text-to-speech functionality
- Text magnifier
- Simple popup interface
- Basic options page
- Russian and English localization

---

## Future Plans

### Planned for v1.1.0
- [ ] Reading mode with article extraction
- [ ] Custom color themes
- [ ] Per-site settings
- [ ] Backup to cloud
- [ ] Screen reader enhancements
- [ ] Dyslexia-friendly layouts
- [ ] Page structure navigator
- [ ] Contrast analyzer

### Planned for v1.2.0
- [ ] Voice commands
- [ ] OCR for images
- [ ] Smart text selection
- [ ] Custom keyboard shortcuts configuration
- [ ] Integration with browser's accessibility features
- [ ] Mobile version

---

## Notes

- This extension prioritizes accessibility and eye health
- All features work offline
- No data is collected or shared
- Open source and community-driven

For bug reports and feature requests, please visit our [GitHub Issues](https://github.com/yourusername/eye-vision-protector/issues).
