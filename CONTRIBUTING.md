# Contributing to Eye Vision Protector

Thank you for considering contributing to Eye Vision Protector! 🎉

## 🚀 Getting Started

### Prerequisites
- Chrome/Edge Browser (v88+)
- Basic knowledge of JavaScript, HTML, CSS
- Git installed

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/eye-vision-protector.git
cd eye-vision-protector

# Load in browser
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project folder
```

## 📁 Project Structure

```
├── manifest.json       # Extension config
├── background.js       # Service worker (background tasks)
├── content.js          # Injected into web pages
├── popup/
│   ├── popup.html     # Main UI
│   ├── popup.css      # Styling
│   ├── popup.js       # UI logic
│   └── images/        # Icons
├── options/
│   ├── options.html   # Settings page
│   ├── options.css    # Settings styling
│   └── options.js     # Settings logic
└── _locales/          # Translations (EN, RU)
```

## 🎯 How to Contribute

### 1. Find an Issue
- Check [Issues](https://github.com/yourusername/eye-vision-protector/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes
- Write clean, commented code
- Follow existing code style
- Test thoroughly

### 4. Commit
```bash
git add .
git commit -m "feat: Add new feature"
# or
git commit -m "fix: Fix bug description"
```

**Commit message format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### 5. Push & Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## 💻 Development Guidelines

### Code Style
- Use **2 spaces** for indentation
- Use **camelCase** for variables/functions
- Use **descriptive names**
- Add **comments** for complex logic
- Keep functions **small and focused**

### JavaScript
```javascript
// Good ✅
function calculateDarkModeIntensity(percentage) {
  // Convert percentage to decimal
  return percentage / 100;
}

// Bad ❌
function calc(p) {
  return p / 100;
}
```

### CSS
```css
/* Good ✅ */
.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

/* Bad ❌ */
.btn{background:#667eea;padding:12px;}
```

### HTML
```html
<!-- Good ✅ -->
<button id="save-settings" class="btn-primary" data-i18n="save">
  Save
</button>

<!-- Bad ❌ -->
<button onclick="save()">Save</button>
```

## 🐛 Reporting Bugs

Use this template:

```markdown
## Bug Description
[Clear description]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Extension Version: 1.0.0

## Console Errors
[F12 → Console errors]
```

## ✨ Feature Requests

Use this template:

```markdown
## Feature Description
[Clear description of the feature]

## Problem It Solves
[What problem does this solve?]

## Proposed Solution
[How would it work?]

## Alternatives Considered
[Other approaches you thought of]

## Additional Context
[Screenshots, mockups, etc.]
```

## 🧪 Testing

Before submitting PR:

1. **Test Manually**
   - Test all affected features
   - Check on multiple websites
   - Verify on different browsers

2. **Check Console**
   - No errors in console (F12)
   - No warnings

3. **Test Performance**
   - Extension loads quickly
   - No lag or freezing
   - Memory usage reasonable

4. **Cross-browser**
   - Test on Chrome
   - Test on Edge
   - Test on Brave (if possible)

See [TESTING.md](TESTING.md) for detailed checklist.

## 📝 Documentation

When adding features:
- Update README.md
- Update CHANGELOG.md
- Add inline code comments
- Update translations if needed (_locales/)

## 🌍 Translations

We support:
- English (en)
- Russian (ru)

To add a translation:
1. Create `_locales/[language-code]/messages.json`
2. Copy structure from `_locales/en/messages.json`
3. Translate all strings
4. Update `manifest.json` if needed

## 🎨 UI/UX Guidelines

- **Colors:** Use purple gradient (#667eea to #764ba2)
- **Spacing:** Use multiples of 4px (8px, 12px, 16px, 20px)
- **Border Radius:** 8px for most elements, 50% for circles
- **Transitions:** 0.3s ease for most animations
- **Shadows:** Use subtle shadows (0 2px 8px rgba(0,0,0,0.08))

## 🔒 Security

- Never collect user data
- No external API calls
- All processing local
- No tracking or analytics
- Respect privacy

## 📜 License

By contributing, you agree that your contributions will be licensed under GPL v3.0.

## 💬 Communication

- GitHub Issues for bugs/features
- Pull Requests for code
- Discussions for questions

## 🙏 Thank You!

Every contribution helps make the web more accessible. Thank you for your time and effort!

---

### Quick Links
- [Issues](https://github.com/yourusername/eye-vision-protector/issues)
- [Pull Requests](https://github.com/yourusername/eye-vision-protector/pulls)
- [Project Board](https://github.com/yourusername/eye-vision-protector/projects)

---

Made with ❤️ by the community
