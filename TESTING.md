# Testing Guide for Eye Vision Protector v1.0.0

## Before Testing

1. **Load the Extension**
   ```
   1. Open Chrome/Edge
   2. Go to chrome://extensions
   3. Enable "Developer mode"
   4. Click "Load unpacked"
   5. Select the extension folder
   ```

2. **Clear Previous Settings** (if upgrading)
   ```
   1. Right-click extension icon
   2. Click "Remove from Chrome"
   3. Reinstall from scratch
   ```

---

## Test Checklist

### ✅ Basic Functionality

- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens popup
- [ ] Popup loads without errors
- [ ] All UI elements are visible
- [ ] Language switcher works (EN ↔ RU)

### ✅ Text Settings

- [ ] Font size slider (0-10) changes text size
- [ ] Font family dropdown changes fonts
- [ ] Bold text toggle works
- [ ] Changes persist after closing popup
- [ ] Changes apply to multiple tabs

### ✅ Dark Mode (CRITICAL)

- [ ] Manual dark mode toggle works
- [ ] Auto mode switches at 8 PM / 7 AM
- [ ] **Images remain normal (not inverted)** ✨
- [ ] **Videos display correctly** ✨
- [ ] Dark mode intensity slider works (50-100%)
- [ ] Canvas elements work properly
- [ ] Background images preserved
- [ ] Quick toggle button in popup works

**Test websites:**
- YouTube (videos)
- Instagram (images)
- Wikipedia (mix of content)
- News sites (photos)
- GitHub (code blocks)

### ✅ Blue Light Filter

- [ ] Toggle enables orange tint
- [ ] Intensity slider (0-100%) changes tint
- [ ] Filter doesn't affect images too much
- [ ] Works together with dark mode
- [ ] Setting persists

### ✅ Focus Mode

- [ ] Toggle activates blur/dim effect
- [ ] Hovering removes blur on element
- [ ] Works on complex pages
- [ ] Doesn't break layouts
- [ ] Performance is smooth

### ✅ Color Blind Modes

- [ ] Protanopia filter applies
- [ ] Deuteranopia filter applies
- [ ] Tritanopia filter applies
- [ ] Achromatopsia (grayscale) applies
- [ ] None mode removes filter

### ✅ Text-to-Speech

- [ ] Toggle enables TTS
- [ ] Select text → Right-click → "Read text aloud"
- [ ] Russian text detected correctly
- [ ] English text detected correctly
- [ ] Volume slider (0-100%) works
- [ ] Volume setting persists

### ✅ Text Magnifier

- [ ] Toggle enables magnifier
- [ ] Select text → Right-click → "Magnify text"
- [ ] Magnifier window appears
- [ ] Text is enlarged properly
- [ ] Window is draggable
- [ ] +/- zoom buttons work
- [ ] Close button works
- [ ] Theme changes with dark mode

### ✅ Statistics

- [ ] Active time shows reasonable value
- [ ] Theme switches counter increments
- [ ] Last used date is correct
- [ ] Stats visible in Advanced Settings

### ✅ Advanced Settings

- [ ] "Advanced Settings" button opens options page
- [ ] Tabs switch correctly (General, CSS, Sites, Data)
- [ ] All content loads properly

### ✅ Custom CSS

- [ ] CSS editor loads
- [ ] Can type CSS code
- [ ] Save button applies CSS to all tabs
- [ ] Clear button removes CSS
- [ ] Invalid CSS doesn't crash extension

**Test CSS:**
```css
body {
  border: 5px solid red !important;
}
```

### ✅ Site Management

- [ ] Can add new site (e.g., example.com)
- [ ] Site appears in list
- [ ] Remove button deletes site
- [ ] Extension disabled on that site
- [ ] Works across browser restart

### ✅ Export/Import

- [ ] Export button downloads JSON file
- [ ] File contains all settings
- [ ] Import button accepts file
- [ ] Settings restore correctly
- [ ] Toast notification shows success

### ✅ Keyboard Shortcuts

- [ ] `Ctrl+Shift+D` toggles dark mode
- [ ] Works on any webpage
- [ ] Shortcut responds quickly

### ✅ UI/UX

- [ ] Gradient backgrounds display correctly
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] Text is readable
- [ ] Buttons respond to hover
- [ ] Sliders move smoothly
- [ ] Toggle switches animate
- [ ] Toast messages appear/disappear correctly

### ✅ Performance

- [ ] Extension loads quickly (<1s)
- [ ] No lag when switching settings
- [ ] Browser remains responsive
- [ ] CPU usage low (<1%)
- [ ] Memory usage reasonable (~10MB)
- [ ] No console errors

### ✅ Cross-Tab Behavior

- [ ] Changes apply to all open tabs
- [ ] New tabs get current settings
- [ ] Settings sync across tabs

### ✅ Persistence

- [ ] Close browser and reopen
- [ ] All settings preserved
- [ ] Theme state maintained
- [ ] Statistics accurate

---

## Known Issues to Watch For

### Fixed in v1.0.0
- ✅ Dark mode no longer inverts images
- ✅ Videos display correctly in dark mode
- ✅ Speech volume works properly
- ✅ Theme switching is reliable

### Potential Issues
- On some sites with aggressive CSS, dark mode might need adjustment
- Focus mode may need tuning for specific layouts
- Blue light filter combined with dark mode needs testing

---

## Bug Reporting

If you find issues, report with:

1. **Browser & Version:** Chrome 120 / Edge 120
2. **OS:** Windows 11 / macOS / Linux
3. **Website:** Where the issue occurred
4. **Steps:** How to reproduce
5. **Expected:** What should happen
6. **Actual:** What actually happened
7. **Screenshot:** If visual issue
8. **Console:** Any errors (F12 → Console)

---

## Test Results Template

```
Date: YYYY-MM-DD
Tester: Your Name
Browser: Chrome/Edge + Version
OS: Windows/Mac/Linux

✅ All tests passed
❌ Issues found:
  1. [Issue description]
  2. [Issue description]

Notes:
[Any additional observations]
```

---

## Performance Testing

### Tools
- Chrome DevTools Performance tab
- Task Manager
- Memory Profiler

### Metrics to Check
- Load time: < 1 second
- CPU: < 1%
- Memory: ~10MB
- No memory leaks after extended use

---

## Accessibility Testing

- Test with screen reader (NVDA/JAWS)
- Test with high contrast mode
- Test with zoom (browser zoom)
- Test keyboard-only navigation

---

Happy Testing! 🧪
