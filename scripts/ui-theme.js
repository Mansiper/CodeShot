/* ════════════════════════════════════════════
   UI theme (light/dark)
════════════════════════════════════════════ */

(function initUiTheme() {
  const saved = localStorage.getItem(UI_THEME_KEY);
  if (saved === 'light') document.body.classList.add('light');
  const btn = document.getElementById('theme-mode-btn');
  if (!btn) return;
  const updateIcon = () => {
    btn.innerHTML = document.body.classList.contains('light') ? moonIcon : sunIcon;
  };
  updateIcon();
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem(UI_THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark');
    updateIcon();
  });
})();
