const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const links = navMenu.querySelectorAll("a, button");

// Toggle menu open/close
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Auto close when clicking a link or button
links.forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

const currencies = [
  { code: "USD", flag: "us" },
  { code: "EUR", flag: "eu" },
  { code: "GBP", flag: "gb" },
  { code: "JPY", flag: "jp" },
  { code: "CNY", flag: "cn" },
  { code: "CHF", flag: "ch" },
  { code: "CAD", flag: "ca" },
  { code: "AUD", flag: "au" },
  { code: "NZD", flag: "nz" },
  { code: "SGD", flag: "sg" },
  { code: "SEK", flag: "se" },
  { code: "NOK", flag: "no" },
  { code: "PLN", flag: "pl" },
  { code: "ZAR", flag: "za" },
  { code: "NGN", flag: "ng" },
  { code: "EGP", flag: "eg" },
  { code: "GHS", flag: "gh" },
  { code: "KES", flag: "ke" },
  { code: "INR", flag: "in" },
  { code: "BRL", flag: "br" },
  { code: "RUB", flag: "ru" },
  { code: "MXN", flag: "mx" },
  { code: "HKD", flag: "hk" },
  { code: "KRW", flag: "kr" },
  { code: "TRY", flag: "tr" },
  { code: "AED", flag: "ae" },
  { code: "SAR", flag: "sa" },
  { code: "DKK", flag: "dk" },
  { code: "CZK", flag: "cz" },
  { code: "HUF", flag: "hu" },
  { code: "RON", flag: "ro" },
  { code: "BGN", flag: "bg" },
  { code: "HRK", flag: "hr" },
  { code: "XAF", flag: "cm" },
  { code: "GHS", flag: "gh" },
  { code: "ZAR", flag: "za" },
  { code: "NGN", flag: "ng" },
  { code: "MZN", flag: "mz" },
  { code: "KES", flag: "ke" },
  { code: "UGX", flag: "ug" },
  { code: "TZS", flag: "tz" },
  { code: "RWF", flag: "rw" },
  { code: "MAD", flag: "ma" },
];

const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertedInput = document.getElementById("convertedAmount");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");

const apiKey = "2160ef172d31c6f4af2eb5a8"; // Replace with your ExchangeRate API key
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/`;

// Populate selects
currencies.forEach((c) => {
  const opt1 = document.createElement("option");
  opt1.value = c.code;
  opt1.textContent = c.code;
  fromSelect.appendChild(opt1);
  const opt2 = document.createElement("option");
  opt2.value = c.code;
  opt2.textContent = c.code;
  toSelect.appendChild(opt2);
});

// Update flags
function updateFlags() {
  const from = currencies.find((c) => c.code === fromSelect.value);
  const to = currencies.find((c) => c.code === toSelect.value);
  fromFlag.src = `https://flagcdn.com/w20/${from.flag}.png`;
  toFlag.src = `https://flagcdn.com/w20/${to.flag}.png`;
}

// Convert currency using API
async function convertCurrency(isFrom = true) {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = isFrom
    ? parseFloat(amountInput.value)
    : parseFloat(convertedInput.value);
  if (!amount) return;
  try {
    const response = await fetch(`${apiUrl}${from}/${to}/${amount}`);
    const data = await response.json();
    if (data.result === "success") {
      if (isFrom) convertedInput.value = data.conversion_result.toFixed(2);
      else amountInput.value = data.conversion_result.toFixed(2);
    }
  } catch (err) {
    console.error("Conversion error:", err);
  }
}

// Event listeners
// "input"  → fires on every keystroke (desktop + Android)
// "change" → fires when iOS Safari keyboard is dismissed via Done
amountInput.addEventListener("input",  () => convertCurrency(true));
amountInput.addEventListener("change", () => convertCurrency(true));
convertedInput.addEventListener("input",  () => convertCurrency(false));
convertedInput.addEventListener("change", () => convertCurrency(false));
fromSelect.addEventListener("change", () => {
  updateFlags();
  convertCurrency(true);
});
toSelect.addEventListener("change", () => {
  updateFlags();
  convertCurrency(true);
});

// Footer shortcuts
document.querySelectorAll(".crypto-footer h2").forEach((h) => {
  h.addEventListener("click", () => {
    toSelect.value = h.textContent;
    updateFlags();
    convertCurrency(true);
  });
});

// Initialize
fromSelect.value = "USD";
toSelect.value = "EUR";
updateFlags();

// ===== Statistic Counter Animation =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 4000; // ms
  const frameRate = 60;
  const totalFrames = Math.round((duration / 1000) * frameRate);
  const displayValue = (val) => {
    const k = Math.round(val / 1000);
    return k + suffix;
  };
  // Cancel any in-progress animation before starting a new one
  if (el._animFrame) cancelAnimationFrame(el._animFrame);
  let frame = 0;
  const step = () => {
    frame++;
    const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
    el.textContent = displayValue(target * progress);
    if (frame < totalFrames) {
      el._animFrame = requestAnimationFrame(step);
    } else {
      el.textContent = displayValue(target);
      el._animFrame = null;
    }
  };
  el._animFrame = requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      } else {
        // Reset to 0 when scrolled out so it re-animates on next entry
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

document.querySelectorAll(".stat-number").forEach((el) => {
  statObserver.observe(el);
});







