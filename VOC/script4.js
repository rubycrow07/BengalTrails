
const $ = id => document.getElementById(id);

// ----------------- User Authentication -----------------

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// ----------------- Login Page -----------------

if (window.location.pathname.endsWith('login.html')) {
  const form = $('login-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const password = $('password').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      window.location.href = 'menu.html';
    } else {
      alert('Invalid email or password');
    }
  });
}

// ----------------- Register Page -----------------

if (window.location.pathname.endsWith('register.html')) {
  const form = $('register-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const password = $('password').value;
    const confirmPassword = $('confirm-password').value;
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    let users = getUsers();
    if (users.find(u => u.email === email)) {
      alert('User with this email already exists.');
      return;
    }
    const newUser = { email, password, bookings: [] };
    users.push(newUser);
    saveUsers(users);
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
  });
}

// ----------------- Menu Page -----------------

if (window.location.pathname.endsWith('menu.html')) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login first');
    window.location.href = 'login.html';
  } else {
    $('user-email').textContent = user.email;
  }

  $('logout-btn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = 'logout.html';
  });
}

// ----------------- Search Page -----------------

if (window.location.pathname.endsWith('search.html')) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login first');
    window.location.href = 'login.html';
  }
  $('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const origin = $('origin').value.trim();
    const destination = $('destination').value.trim();
    const date = $('date').value;
    if (!origin || !destination || !date) {
      alert('Please fill all fields');
      return;
    }
    sessionStorage.setItem('searchCriteria', JSON.stringify({ origin, destination, date }));
    window.location.href = 'search-results.html';
  });
}

// ----------------- Search Results Page -----------------

if (window.location.pathname.endsWith('search-results.html')) {
  const criteriaRaw = sessionStorage.getItem('searchCriteria');
  if (!criteriaRaw) {
    alert('No search data found.');
    window.location.href = 'search.html';
  } else {
    const criteria = JSON.parse(criteriaRaw);

    const resultsContainer = $('results-container');

    const dummyFlights = [
      { id: 'F1001', airline: 'Air India', from: criteria.origin, to: criteria.destination, date: criteria.date, time: '10:00 AM', price: 3500 },
      { id: 'F1002', airline: 'IndiGo', from: criteria.origin, to: criteria.destination, date: criteria.date, time: '1:00 PM', price: 3200 },
      { id: 'F1003', airline: 'SpiceJet', from: criteria.origin, to: criteria.destination, date: criteria.date, time: '6:00 PM', price: 3000 }
    ];

    resultsContainer.innerHTML = `<h1>Available Flights from ${criteria.origin} to ${criteria.destination} on ${criteria.date}</h1>`;

    dummyFlights.forEach(flight => {
      const card = document.createElement('div');
      card.className = 'flight-card';
      card.innerHTML = `
        <div class="flight-info">
          <h2>${flight.airline} - ${flight.id}</h2>
          <p>From: ${flight.from}</p>
          <p>To: ${flight.to}</p>
          <p>Date: ${flight.date}</p>
          <p>Time: ${flight.time}</p>
          <p>Price: ₹${flight.price}</p>
        </div>
        <a href="#" class="book-btn" data-flight='${JSON.stringify(flight)}'>Book Tickets</a>
      `;
      resultsContainer.appendChild(card);
    });

    resultsContainer.insertAdjacentHTML('beforeend', `<a href="search.html" class="back-link">← Back to Search</a>`);

    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const flight = JSON.parse(btn.dataset.flight);
        sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
        window.location.href = 'booking.html';
      });
    });
  }
}

// ----------------- Booking Page -----------------

if (window.location.pathname.endsWith('booking.html')) {
  const flightRaw = sessionStorage.getItem('selectedFlight');
  if (!flightRaw) {
    alert('No flight selected.');
    window.location.href = 'search.html';
  } else {
    const flight = JSON.parse(flightRaw);
    const flightInfoDiv = $('flight-info');
    flightInfoDiv.innerHTML = `
      <h1>Booking for ${flight.airline} (${flight.id})</h1>
      <p>From: ${flight.from} To: ${flight.to}</p>
      <p>Date: ${flight.date} Time: ${flight.time}</p>
      <p>Price per ticket: ₹${flight.price}</p>
    `;

    const generateBtn = $('generate-passenger-fields');
    const passengerContainer = $('passenger-details');
    const finalSubmit = $('final-submit');

    generateBtn.addEventListener('click', () => {
      const count = parseInt($('passenger-count').value, 10);
      if (!count || count < 1 || count > 10) {
        alert('Enter a valid passenger count (1–10).');
        return;
      }

      passengerContainer.innerHTML = '';

      for (let i = 1; i <= count; i++) {
        passengerContainer.innerHTML += `
          <fieldset>
            <legend>Passenger ${i}</legend>
            <label for="name-${i}">Full Name:</label>
            <input type="text" id="name-${i}" required />

            <label for="age-${i}">Age:</label>
            <input type="number" id="age-${i}" required min="0" />

            <label for="email-${i}">Email:</label>
            <input type="email" id="email-${i}" required />

            <label for="mobile-${i}">Mobile:</label>
            <input type="tel" id="mobile-${i}" required pattern="[0-9]{10}" title="Enter 10 digit mobile number" />
          </fieldset>
        `;
      }

      finalSubmit.style.display = 'block';
    });

    $('booking-form').addEventListener('submit', e => {
      e.preventDefault();
      const count = parseInt($('passenger-count').value, 10);
      const passengers = [];

      for (let i = 1; i <= count; i++) {
        const name = $(`name-${i}`).value.trim();
        const age = parseInt($(`age-${i}`).value, 10);
        const email = $(`email-${i}`).value.trim();
        const mobile = $(`mobile-${i}`).value.trim();

        if (!name || !age || !email || !mobile) {
          alert(`Please fill all details for passenger ${i}`);
          return;
        }

        passengers.push({ name, age, email, mobile });
      }

      const bookingDetails = {
        flight,
        passengers,
        passengerCount: count,
        totalPrice: flight.price * count,
      };

      sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
      window.location.href = 'payment.html';
    });
  }
}

// ----------------- Payment Page -----------------

if (window.location.pathname.endsWith('payment.html')) {
  const bookingRaw = sessionStorage.getItem('bookingDetails');
  if (!bookingRaw) {
    alert('No booking details found.');
    window.location.href = 'search.html';
  } else {
    const booking = JSON.parse(bookingRaw);
    const paymentInfoDiv = $('payment-info');
    paymentInfoDiv.innerHTML = `
      <h1>Payment for ${booking.flight.airline} (${booking.flight.id})</h1>
      <p>Total Amount: ₹${booking.totalPrice}</p>
    `;

    $('payment-form').addEventListener('submit', e => {
      e.preventDefault();

      const cardNumber = $('card-number').value.replace(/\s+/g, '');
      const expiryDate = $('expiry-date').value;
      const cvv = $('cvv').value;

      if (!cardNumber.match(/^\d{16}$/)) {
        alert('Invalid card number. Must be 16 digits.');
        return;
      }
      if (!expiryDate) {
        alert('Please enter expiry date.');
        return;
      }
      if (!cvv.match(/^\d{3,4}$/)) {
        alert('Invalid CVV.');
        return;
      }

      // Simulate payment success
      alert('Payment successful!');

      // Save booking to user data
      const user = getCurrentUser();
      if (!user) {
        alert('User not logged in. Please login again.');
        window.location.href = 'login.html';
        return;
      }

      // Add booking to user's booking history
      if (!user.bookings) user.bookings = [];
      user.bookings.push({
        ...booking,
        bookingTime: new Date().toISOString()
      });

      // Update user data in localStorage
      const users = getUsers();
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) {
        users[idx] = user;
        saveUsers(users);
        setCurrentUser(user);
      }

      // Clear session storage booking info
      sessionStorage.removeItem('bookingDetails');
      sessionStorage.removeItem('selectedFlight');
      sessionStorage.removeItem('searchCriteria');

      // Store last booking info for confirmation page
      sessionStorage.setItem('lastBooking', JSON.stringify(booking));

      // Redirect to confirmation
      window.location.href = 'confirmation.html';
    });
  }
}

// ----------------- Confirmation Page -----------------

if (window.location.pathname.endsWith('confirmation.html')) {
  const lastBookingRaw = sessionStorage.getItem('lastBooking');
  if (!lastBookingRaw) {
    alert('No confirmation data found.');
    window.location.href = 'menu.html';
  } else {
    const booking = JSON.parse(lastBookingRaw);
    const container = $('confirmation-container');

    // Prepare passenger details string for all passengers
    const passengerDetails = booking.passengers
      .map((p, i) => `Passenger ${i + 1}: ${p.name}, Age: ${p.age}`)
      .join('<br>');

    container.innerHTML = `
      <div class="confirmation-icon">🎉</div>
      <h1>Booking Confirmed!</h1>
      <p>Thank you for booking with us. Have a happy journey!</p>
      <div class="booking-summary">
        <h2>Booking Summary</h2>
        <ul>
          <li><strong>Flight:</strong> ${booking.flight.airline} (${booking.flight.id})</li>
          <li><strong>From:</strong> ${booking.flight.from}</li>
          <li><strong>To:</strong> ${booking.flight.to}</li>
          <li><strong>Date:</strong> ${booking.flight.date}</li>
          <li><strong>Time:</strong> ${booking.flight.time}</li>
          <li><strong>Passengers:</strong><br>${passengerDetails}</li>
          <li><strong>Passengers Count:</strong> ${booking.passengerCount}</li>
          <li><strong>Total Paid:</strong> ₹${booking.totalPrice}</li>
        </ul>
      </div>
      <div class="btn-group">
        <a href="menu.html" class="btn">Back to Menu</a>
        <a href="history.html" class="btn btn-secondary">View Booking History</a>
      </div>
    `;
  }
}

// ----------------- History Page -----------------

if (window.location.pathname.endsWith('history.html')) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    const historyList = $('history-list');
    if (!user.bookings || user.bookings.length === 0) {
      historyList.innerHTML = '<p>You have no bookings yet.</p>';
    } else {
      historyList.innerHTML = ''; // clear before append
      user.bookings.forEach((booking, i) => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        const date = new Date(booking.bookingTime);
        const passengerDetails = booking.passengers
          .map((p, idx) => `Passenger ${idx + 1}: ${p.name}, Age: ${p.age}`)
          .join('<br>');

        card.innerHTML = `
          <h3>Booking #${i + 1}</h3>
          <p><strong>Flight:</strong> ${booking.flight.airline} (${booking.flight.id})</p>
          <p><strong>From:</strong> ${booking.flight.from} To: ${booking.flight.to}</p>
          <p><strong>Date:</strong> ${booking.flight.date} Time: ${booking.flight.time}</p>
          <p><strong>Passengers:</strong><br>${passengerDetails}</p>
          <p><strong>Passengers Count:</strong> ${booking.passengerCount}</p>
          <p><strong>Booking Date:</strong> ${date.toLocaleString()}</p>
          <p><strong>Total Paid:</strong> ₹${booking.totalPrice}</p>
        `;
        historyList.appendChild(card);
      });
    }

    // Download booking history as JSON
    const downloadBtn = $('download-history-btn');
    if(downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!user.bookings || user.bookings.length === 0) {
          alert('No bookings to download.');
          return;
        }
        const dataStr = JSON.stringify(user.bookings, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-history-${user.email}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
  }
}

// ----------------- Helpline Page -----------------

if (window.location.pathname.endsWith('helpline.html')) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login first.');
    window.location.href = 'login.html';
  }
}
