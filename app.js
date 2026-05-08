// ── BOOT ──
// All modules are loaded before this file via index.html script tags.
// This file only handles theme init and the single entry point call.

initTheme();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
} else {
  setTimeout(init, 100);
}
