const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

/* ========= CURRENCY CONVERTER ========= */
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const amountInput = document.getElementById("amount");
const convertedAmountInput = document.getElementById("convertedAmount");
const dateInput = document.getElementById("date");
const quickTargets = document.querySelectorAll(".crypto-footer h2");
const converterMessage = document.getElementById("converterMessage");

const currencies = {
  USD: { name: "US Dollar", country: "US" },
  EUR: { name: "Euro", country: "EU" },
  GBP: { name: "British Pound", country: "GB" },
  NGN: { name: "Nigerian Naira", country: "NG" },
  XAF: { name: "Central African CFA Franc", country: "CM" },
  CAD: { name: "Canadian Dollar", country: "CA" },
  AUD: { name: "Australian Dollar", country: "AU" },
  JPY: { name: "Japanese Yen", country: "JP" },
  CHF: { name: "Swiss Franc", country: "CH" }
};

function getFlagUrl(countryCode) {
  if (countryCode === "EU") {
    return "https://flagcdn.com/w40/eu.png";
  }
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

function populateCurrencies() {
  const codes = Object.keys(currencies);

  codes.forEach((code) => {
    const fromOption = document.createElement("option");
    fromOption.value = code;
    fromOption.textContent = code;

    const toOption = document.createElement("option");
    toOption.value = code;
    toOption.textContent = code;

    fromCurrency.appendChild(fromOption);
    toCurrency.appendChild(toOption);
  });

  fromCurrency.value = "USD";
  toCurrency.value = "EUR";
  updateFlags();
}

function updateFlags() {
  const fromCode = fromCurrency.value;
  const toCode = toCurrency.value;

  fromFlag.src = getFlagUrl(currencies[fromCode].country);
  fromFlag.alt = `${fromCode} flag`;

  toFlag.src = getFlagUrl(currencies[toCode].country);
  toFlag.alt = `${toCode} flag`;
}

function setTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${year}-${month}-${day}`;
}

function getApiDate() {
  const selectedDate = dateInput.value;
  if (selectedDate) {
    return selectedDate;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value);
  const apiDate = getApiDate();

  if (converterMessage) {
    converterMessage.textContent = "";
  }

  if (!amountInput.value || isNaN(amount) || amount <= 0) {
    convertedAmountInput.value = "";
    return;
  }

  if (from === to) {
    convertedAmountInput.value = amount.toFixed(2);
    if (converterMessage) {
      converterMessage.textContent = `1 ${from} = 1 ${to}`;
    }
    return;
  }

  try {
    convertedAmountInput.value = "Loading...";

    const response = await fetch(
      `https://api.frankfurter.app/${apiDate}?amount=${amount}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }

    const data = await response.json();

    if (data.rates && data.rates[to] !== undefined) {
      const result = Number(data.rates[to]);
      convertedAmountInput.value = result.toFixed(2);

      if (converterMessage) {
        converterMessage.textContent = `1 ${from} = ${(result / amount).toFixed(4)} ${to}`;
      }
    } else {
      convertedAmountInput.value = "";
      if (converterMessage) {
        converterMessage.textContent = "Conversion not available.";
      }
    }
  } catch (error) {
    console.error("Currency conversion error:", error);
    convertedAmountInput.value = "";
    if (converterMessage) {
      converterMessage.textContent =
        "Unable to fetch rates right now. Check your internet connection.";
    }
  }
}

if (fromCurrency && toCurrency && amountInput && convertedAmountInput && dateInput) {
  populateCurrencies();
  setTodayDate();

  fromCurrency.addEventListener("change", () => {
    updateFlags();
    convertCurrency();
  });

  toCurrency.addEventListener("change", () => {
    updateFlags();
    convertCurrency();
  });

  amountInput.addEventListener("input", convertCurrency);
  amountInput.addEventListener("change", convertCurrency); // iOS Safari: fires on keyboard dismiss

  dateInput.addEventListener("change", () => {
    convertCurrency();
  });

  quickTargets.forEach((item) => {
    item.addEventListener("click", () => {
      const quickCode = item.dataset.quick;
      if (quickCode && currencies[quickCode]) {
        toCurrency.value = quickCode;
        updateFlags();
        convertCurrency();
      }
    });
  });
}

/* ========= SIMPLE STAT COUNTER ========= */
const statNumbers = document.querySelectorAll(".stat-number");

function animateCounter(element) {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  let current = 0;
  const increment = Math.ceil(target / 100);

  const update = () => {
    current += increment;

    if (current >= target) {
      element.textContent = `${Math.floor(target / 1000)}${suffix}`;
      return;
    }

    element.textContent = `${Math.floor(current / 1000)}${suffix}`;
    requestAnimationFrame(update);
  };

  update();
}

if (statNumbers.length) {
  statNumbers.forEach((item) => animateCounter(item));
}