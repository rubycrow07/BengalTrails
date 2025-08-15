// ====== DESTINATIONS AUTO-SCROLL ======
(() => {
  const scrollContainer = document.querySelector('.scroll-container');
  const destCards = Array.from(document.querySelectorAll('.dest-card'));
  if (!scrollContainer || destCards.length === 0) return;

  let currentIndex = 0;
  let autoScroll = null;
  let scrollPauseTimeout = null;

  const scrollToCard = (index) => {
    const card = destCards[index];
    const containerCenter = scrollContainer.offsetWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;

    let targetScroll = cardCenter - containerCenter;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.offsetWidth;
    if (targetScroll < 0) targetScroll = 0;
    if (targetScroll > maxScroll) targetScroll = maxScroll;

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    destCards.forEach(c => c.classList.toggle('active', c === card));
  };

  const nextCard = () => {
    currentIndex = (currentIndex + 1) % destCards.length;
    scrollToCard(currentIndex);
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScroll = setInterval(nextCard, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScroll) {
      clearInterval(autoScroll);
      autoScroll = null;
    }
  };

  // ✅ Detect which card is in center
  const getCenteredCardIndex = () => {
    const containerCenter = scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    destCards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });
    return closestIndex;
  };

  // ✅ Pause on scroll, resume after 5s
  scrollContainer.addEventListener('scroll', () => {
    stopAutoScroll();
    if (scrollPauseTimeout) clearTimeout(scrollPauseTimeout);
    scrollPauseTimeout = setTimeout(() => {
      currentIndex = getCenteredCardIndex();
      startAutoScroll();
    }, 3000);
  });

  // ✅ Pause when hovering on a card & resume from that card
  destCards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      stopAutoScroll();
      if (scrollPauseTimeout) clearTimeout(scrollPauseTimeout);
      currentIndex = idx; // set currentIndex to hovered card
    });

    card.addEventListener('mouseleave', () => {
      startAutoScroll(); // resume auto scroll from this card
    });
  });

  scrollToCard(currentIndex);
  startAutoScroll();
})();

// ====== Testimonials Carousel ======
const cards = document.querySelectorAll('.testi-card');
const prevBtn = document.querySelector('.carousel-arrow.prev');
const nextBtn = document.querySelector('.carousel-arrow.next');
const dotContainer = document.querySelector('.carousel-dots');
let currentIndex = 0;

function updateDisplay() {
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === currentIndex);
  });

  const dots = dotContainer.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

function createDots() {
  dotContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');

    dot.addEventListener('click', () => {
      currentIndex = i;
      updateDisplay();
    });

    dotContainer.appendChild(dot);
  });
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateDisplay();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateDisplay();
});

window.addEventListener('load', () => {
  createDots();
  updateDisplay();
});



// ====== CURRENCY CONVERTER ======
(() => {
  const toggleBtn = document.getElementById('toggle-converter');
  const panel = document.getElementById('currency-converter');
  const convertBtn = document.getElementById('convert-btn');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const amountInput = document.getElementById('amount');
  const resultDiv = document.getElementById('conversion-result');
  const amountLabel = document.getElementById('amount-label');

  if (!toggleBtn || !panel || !convertBtn || !fromCurrency || !toCurrency || !amountInput || !resultDiv) return;

  const rates = {
    USD: { INR: 87.18, EUR: 0.865, GBP: 0.753, JPY: 147.55, USD: 1 },
    INR: { USD: 0.01147, EUR: 0.00992, GBP: 0.00863, JPY: 1.692, INR: 1 },
    EUR: { USD: 1.155, INR: 100.76, GBP: 0.869, JPY: 170.54, EUR: 1 },
    GBP: { USD: 1.328, INR: 115.83, EUR: 1.149, JPY: 196.03, GBP: 1 },
    JPY: { USD: 0.00677, INR: 0.5908, EUR: 0.00586, GBP: 0.0051, JPY: 1 }
  };

  const reset = () => {
    amountLabel.textContent = 'Amount:';
    amountInput.style.display = 'block';
    resultDiv.style.display = 'none';
    resultDiv.textContent = '';
    convertBtn.textContent = 'Convert';
  };

  toggleBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggleBtn.style.display = open ? 'none' : 'block';
    if (!open) {
      toggleBtn.classList.add('bounce');
      setTimeout(() => toggleBtn.classList.remove('bounce'), 600);
    }
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggleBtn.contains(e.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      toggleBtn.style.display = 'block';
      toggleBtn.classList.add('bounce');
      setTimeout(() => toggleBtn.classList.remove('bounce'), 600);
    }
  });

  convertBtn.addEventListener('click', () => {
    if (convertBtn.textContent === 'Clear') return reset();

    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
      resultDiv.style.display = 'block';
      resultDiv.textContent = 'Enter a valid amount';
      amountInput.style.display = 'none';
      convertBtn.textContent = 'Clear';
      return;
    }

    const rate = rates[from]?.[to];
    if (!rate) {
      resultDiv.style.display = 'block';
      resultDiv.textContent = 'Conversion rate not available';
      amountInput.style.display = 'none';
      convertBtn.textContent = 'Clear';
      return;
    }

    const converted = (amount * rate).toFixed(2);
    amountInput.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.textContent = `${amount} ${from} = ${converted} ${to}`;
    amountLabel.textContent = 'Result:';
    convertBtn.textContent = 'Clear';
  });

  [fromCurrency, toCurrency, amountInput].forEach(el => el.addEventListener('change', reset));
  amountInput.addEventListener('focus', reset);
})();

// ====== BACK TO TOP ======
(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.style.display = window.scrollY > 300 ? 'flex' : 'none');
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ====== WEATHER WIDGET ======
(() => {
  const fetchWeather = (city, widget) => {
    fetch(`https://wttr.in/${city}?format=j1`)
      .then(res => res.json())
      .then(data => {
        const tempC = data.current_condition[0].temp_C;
        const cond = data.current_condition[0].weatherDesc[0].value.toLowerCase();
        const icon = cond.includes('rain') ? '🌧️' : cond.includes('cloud') ? '☁️' : cond.includes('sun') ? '☀️' : '🌡️';
        widget.innerText = `${icon} ${tempC}°C`;
      })
      .catch(() => widget.innerText = 'N/A');
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.weather-widget').forEach(widget => {
      const city = widget.getAttribute('data-city');
      if (city) fetchWeather(city, widget);
    });
  });
})();

// ====== SUBSCRIBE FORM ======
(() => {
  const form = document.getElementById('subscribe-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const msg = document.getElementById('subscription-msg');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(email)) {
      msg.style.display = 'block';
      msg.style.color = 'green';
      msg.textContent = 'Thank you for subscribing!';
      form.reset();
    } else {
      msg.style.display = 'block';
      msg.style.color = 'red';
      msg.textContent = 'Please enter a valid email address.';
    }
    setTimeout(() => msg.style.display = 'none', 3000);
  });
})();
