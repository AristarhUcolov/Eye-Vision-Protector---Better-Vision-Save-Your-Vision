# Changelog

All notable changes to this project will be documented in this file.

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
