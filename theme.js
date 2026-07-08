// ============================================================
// theme.js — chuyển đổi Light / Dark mode
// ============================================================

function getStoredTheme() {
  try { return localStorage.getItem("yodoku-theme"); } catch (e) { return null; }
}
function setStoredTheme(theme) {
  try { localStorage.setItem("yodoku-theme", theme); } catch (e) { /* ignore */ }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.setAttribute("aria-label", theme === "dark" ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode");
}

(function initTheme() {
  const saved = getStoredTheme();
  const theme = saved || (window.CONFIG && CONFIG.DEFAULT_THEME) || "light";
  applyTheme(theme);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  setStoredTheme(next);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", toggleTheme);
});
