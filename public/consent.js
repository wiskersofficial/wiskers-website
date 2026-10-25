(() => {
  const key = "wiskers-analytics-consent";
  const maxAge = 180 * 24 * 60 * 60 * 1000;
  const projectId = document.documentElement.dataset.clarityProject || "";
  const clarityUrl = projectId ? "https://www.clarity.ms/tag/" + encodeURIComponent(projectId) : "";
  let clarityLoaded = false;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (!saved || !["granted", "denied"].includes(saved.choice)) return null;
      if (!Number.isFinite(saved.savedAt) || saved.savedAt > Date.now() || Date.now() - saved.savedAt > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      return saved.choice;
    } catch {
      return null;
    }
  }

  function clearClarityCookies() {
    for (const name of ["_clck", "_clsk"]) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=; Max-Age=0; path=/; domain=" + location.hostname + "; SameSite=Lax";
    }
  }

  function sendClarityConsent(choice) {
    if (typeof window.clarity !== "function") return;
    window.clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: choice === "granted" ? "granted" : "denied"
    });
  }

  function loadClarity() {
    if (!clarityUrl || clarityLoaded) return;
    clarityLoaded = true;
    window.clarity = window.clarity || function() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    sendClarityConsent("granted");
    const script = document.createElement("script");
    script.async = true;
    script.src = clarityUrl;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(key, JSON.stringify({ choice, savedAt: Date.now() }));
    } catch {}
    if (choice === "granted") loadClarity();
    else {
      sendClarityConsent("denied");
      clearClarityCookies();
    }
  }

  function showBanner() {
    const existing = document.querySelector(".wiskers-consent");
    if (existing) {
      existing.hidden = false;
      existing.querySelector("button")?.focus();
      return;
    }
    const banner = document.createElement("section");
    banner.className = "wiskers-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Optional analytics choice");
    banner.innerHTML = '<div class="wiskers-consent__copy"><strong>Help us improve Wiskers?</strong><p>Optional Microsoft Clarity analytics show us how the site is used. They stay off unless you accept. <a href="/privacy/index.html">Privacy &amp; cookies</a></p></div><div class="wiskers-consent__actions"><button type="button" data-consent-choice="denied">Reject optional</button><button type="button" data-consent-choice="granted">Accept analytics</button></div>';
    banner.addEventListener("click", event => {
      const choice = event.target.closest("[data-consent-choice]")?.dataset.consentChoice;
      if (!choice) return;
      saveChoice(choice);
      banner.remove();
      const status = document.querySelector("#analytics-preference-status");
      if (status) status.textContent = choice === "granted" ? "Analytics accepted for six months." : "Optional analytics rejected for six months.";
    });
    document.body.appendChild(banner);
    banner.querySelector("button")?.focus({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const choice = readChoice();
    if (choice === "granted") loadClarity();
    else {
      clearClarityCookies();
      if (!choice) showBanner();
    }
    document.querySelectorAll("[data-open-analytics-consent]").forEach(button => {
      button.addEventListener("click", showBanner);
    });
  });
})();
