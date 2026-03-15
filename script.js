// ── Hamburger menu ─────────────────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const navMenu   = document.getElementById("navMenu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  navMenu.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// ── Email form — prevent page reload on submit ───────────────────────────────
const emailForm = document.querySelector("form.email");
if (emailForm) emailForm.addEventListener("submit", (e) => e.preventDefault());

// ── Currency Converter ───────────────────────────────────────────────────────
const fromSelect     = document.getElementById("fromCurrency");
const toSelect       = document.getElementById("toCurrency");
const fromFlag       = document.getElementById("fromFlag");
const toFlag         = document.getElementById("toFlag");
const amountInput    = document.getElementById("amount");
const convertedInput = document.getElementById("convertedAmount");
const dateInput      = document.getElementById("date");

if (fromSelect && toSelect && amountInput && convertedInput) {

  // Frankfurter API — free, no key required
  // Supported currencies: major ECB-tracked currencies only
  const currencies = [
    { code: "USD", flag: "us" }, { code: "EUR", flag: "eu" },
    { code: "GBP", flag: "gb" }, { code: "JPY", flag: "jp" },
    { code: "CNY", flag: "cn" }, { code: "CHF", flag: "ch" },
    { code: "CAD", flag: "ca" }, { code: "AUD", flag: "au" },
    { code: "NZD", flag: "nz" }, { code: "SGD", flag: "sg" },
    { code: "SEK", flag: "se" }, { code: "NOK", flag: "no" },
    { code: "PLN", flag: "pl" }, { code: "ZAR", flag: "za" },
    { code: "INR", flag: "in" }, { code: "BRL", flag: "br" },
    { code: "MXN", flag: "mx" }, { code: "HKD", flag: "hk" },
    { code: "KRW", flag: "kr" }, { code: "TRY", flag: "tr" },
    { code: "AED", flag: "ae" }, { code: "SAR", flag: "sa" },
    { code: "DKK", flag: "dk" }, { code: "CZK", flag: "cz" },
    { code: "HUF", flag: "hu" }, { code: "RON", flag: "ro" },
  ];

  // Populate dropdowns
  currencies.forEach(({ code }) => {
    fromSelect.appendChild(new Option(code, code));
    toSelect.appendChild(new Option(code, code));
  });
  fromSelect.value = "USD";
  toSelect.value   = "EUR";

  // Flags
  function updateFlags() {
    const fc = fromSelect.value.toLowerCase();
    const tc = toSelect.value.toLowerCase();
    if (fromFlag) fromFlag.src = `https://flagcdn.com/w40/${fc}.png`;
    if (toFlag)   toFlag.src   = `https://flagcdn.com/w40/${tc}.png`;
  }
  updateFlags();

  // Set today's date
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  // Guard against overlapping fetches
  let converting = false;

  async function convertCurrency() {
    if (converting) return;
    const from   = fromSelect.value;
    const to     = toSelect.value;
    const amount = parseFloat(amountInput.value);

    if (!amountInput.value || isNaN(amount) || amount <= 0) {
      convertedInput.value = "";
      return;
    }
    if (from === to) {
      convertedInput.value = amount.toFixed(2);
      return;
    }

    const date = (dateInput && dateInput.value) || new Date().toISOString().slice(0, 10);
    converting = true;
    convertedInput.value = "...";
    try {
      const res  = await fetch(
        `https://api.frankfurter.app/${date}?amount=${encodeURIComponent(amount)}&from=${from}&to=${to}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      convertedInput.value = data.rates && data.rates[to] !== undefined
        ? Number(data.rates[to]).toFixed(2)
        : "N/A";
    } catch (err) {
      console.error("Conversion error:", err);
      convertedInput.value = "Error";
    } finally {
      converting = false;
    }
  }

  // Both "input" and "change" — "input" fires per keystroke (desktop/Android),
  // "change" fires when iOS Safari keyboard is dismissed via Done
  amountInput.addEventListener("input",  convertCurrency);
  amountInput.addEventListener("change", convertCurrency);

  fromSelect.addEventListener("change", () => { updateFlags(); convertCurrency(); });
  toSelect.addEventListener("change",   () => { updateFlags(); convertCurrency(); });

  if (dateInput) dateInput.addEventListener("change", convertCurrency);

  // Footer quick-select shortcuts
  document.querySelectorAll(".crypto-footer h2").forEach((h) => {
    h.addEventListener("click", () => {
      const code = h.dataset.quick || h.textContent.trim();
      const exists = Array.from(toSelect.options).some((o) => o.value === code);
      if (exists) {
        toSelect.value = code;
        updateFlags();
        convertCurrency();
      }
    });
  });
}

// ── Statistic Counter Animation ──────────────────────────────────────────────
const statNumbers = document.querySelectorAll(".stat-number");

function animateCounter(el) {
  const target      = parseInt(el.dataset.target, 10);
  const suffix      = el.dataset.suffix || "";
  const totalFrames = Math.round((4000 / 1000) * 60);
  if (el._animFrame) cancelAnimationFrame(el._animFrame);
  let frame = 0;
  const step = () => {
    frame++;
    const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
    el.textContent = `${Math.round((target * progress) / 1000)}${suffix}`;
    if (frame < totalFrames) {
      el._animFrame = requestAnimationFrame(step);
    } else {
      el.textContent = `${Math.round(target / 1000)}${suffix}`;
      el._animFrame = null;
    }
  };
  el._animFrame = requestAnimationFrame(step);
}

if (statNumbers.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
        } else {
          if (entry.target._animFrame) {
            cancelAnimationFrame(entry.target._animFrame);
            entry.target._animFrame = null;
          }
          entry.target.textContent = "0";
        }
      });
    },
    { threshold: 0.4 }
  );
  statNumbers.forEach((el) => statObserver.observe(el));
}
