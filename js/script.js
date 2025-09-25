(function () {
  "use strict";

  var CART_KEY = "cart";

  function parsePrice(v) {
    return Number(String(v || "").replace(/[^0-9.\-]+/g, "")) || 0;
  }

  function parseQty(v) {
    var n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]").map(function (it) {
        return {
          name: String(it.name || ""),
          price: parsePrice(it.price),
          qty: parseQty(it.qty)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addToCart(name, price) {
    if (!name) return;
    var cart = getCart();
    var existing = cart.find(function (i) { return i.name === name; });
    if (existing) existing.qty++;
    else cart.push({ name: String(name), price: parsePrice(price), qty: 1 });
    saveCart(cart);
    renderCart();
  }

  function updateQty(index, newQty) {
    var cart = getCart();
    if (index < 0 || index >= cart.length) return;
    var qty = parseQty(newQty);
    if (qty === 0) cart.splice(index, 1);
    else cart[index].qty = qty;
    saveCart(cart);
    renderCart();
  }

  function removeFromCart(index) {
    var cart = getCart();
    if (index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  }

  function renderCart() {
    var container = document.getElementById("cartItems");
    if (!container) return;
    var cart = getCart();
    if (!cart.length) {
      container.innerHTML = '<tr><td colspan="3">Cart is empty</td></tr>';
      return;
    }
    var html = "";
    var totalAll = 0;
    cart.forEach(function (item, idx) {
      var totalPrice = item.price * item.qty;
      totalAll += totalPrice;
      html += '<tr data-index="' + idx + '">' +
              '<td>' + item.name + '</td>' +
              '<td><input type="number" min="1" value="' + item.qty + '" class="cart-qty" data-index="' + idx + '" style="width:60px;padding:4px;border:1px solid #ccc;border-radius:4px;"></td>' +
              '<td>' + totalPrice.toFixed(2) + '</td>' +
              '<td><button class="btn remove-item" data-index="' + idx + '">Remove</button></td>' +
              '</tr>';
    });
    html += '<tr>' +
            '<td colspan="2" style="text-align:right"><strong>Total</strong></td>' +
            '<td><strong>' + totalAll.toFixed(2) + '</strong></td>' +
            '<td></td>' +
            '</tr>';
    container.innerHTML = html;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }

  function setupForms() {
    var loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = loginForm.querySelector('input[type="email"]').value.trim();
        var password = loginForm.querySelector('input[type="password"]').value;
        if (!isValidEmail(email)) {
          alert("Please enter a valid email address containing '@'");
          return;
        }
        if (!isStrongPassword(password)) {
          alert("Weak password. It must have at least 8 characters, including an uppercase, a lowercase and a number.");
          return;
        }
        alert("Signed in successfully");
        loginForm.reset();
      });
    }

    var registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = registerForm.querySelector('input[type="email"]').value.trim();
        var password = registerForm.querySelector('input[type="password"]').value;
        if (!isValidEmail(email)) {
          alert("email address must contain '@'");
          return;
        }
        if (!isStrongPassword(password)) {
          alert("Weak password.");
          return;
        }
        alert("Account created successfully");
        registerForm.reset();
      });
    }

    var checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Payment processed successfully");
        checkoutForm.reset();
        saveCart([]);
        renderCart();
      });
    }
  }

  function setupMenuToggle() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
  }

  function setupCartEvents() {
    document.body.addEventListener("click", function (e) {
      var addBtn = e.target.closest(".add-to-cart");
      if (addBtn) { addToCart(addBtn.dataset.name || "", addBtn.dataset.price || 0); return; }
      var rem = e.target.closest(".remove-item");
      if (rem) { removeFromCart(Number(rem.dataset.index)); return; }
    });

    document.body.addEventListener("input", function (e) {
      var qtyInput = e.target.closest(".cart-qty");
      if (qtyInput) updateQty(Number(qtyInput.dataset.index), qtyInput.value);
    });
  }

  function setupCountdown() {
    window._saleDate = new Date();
    window._saleDate.setHours(window._saleDate.getHours() + 24);
    function updateCountdown() {
      var el = document.getElementById("countdown");
      if (!el || !window._saleDate) return;
      var now = Date.now();
      var distance = window._saleDate.getTime() - now;
      if (distance < 0) {
        el.innerText = "Sale ended";
        clearInterval(window._cd);
        return;
      }
      var d = Math.floor(distance / 86400000);
      var h = Math.floor((distance % 86400000) / 3600000);
      var m = Math.floor((distance % 3600000) / 60000);
      var s = Math.floor((distance % 60000) / 1000);
      el.innerText = (d > 0 ? d + "d " : "") + h + "h " + m + "m " + s + "s";
    }
    window._cd = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  function setupScrollReveal() {
    var revealTargets = Array.prototype.slice.call(document.querySelectorAll(".product-card, .card, .gallery-grid figure"));
    if ("IntersectionObserver" in window && revealTargets.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
          } else {
            el.style.opacity = 0;
            el.style.transform = "translateY(30px)";
          }
        });
      }, { rootMargin: "0px 0px -60px 0px", threshold: 0 });
      revealTargets.forEach(function (t) {
        t.style.opacity = 0;
        t.style.transform = "translateY(30px)";
        io.observe(t);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    setupForms();
    setupMenuToggle();
    setupCartEvents();
    setupCountdown();
    setupScrollReveal();
  });

  window.addToCart = addToCart;
  window.removeItem = removeFromCart;

  window.initMap = function() {
    var loc = { lat: 24.7136, lng: 46.6753 };
    var mapEl = document.getElementById('map');
    if (!mapEl) return;
    var map = new google.maps.Map(mapEl, { zoom: 10, center: loc });
    new google.maps.Marker({ position: loc, map: map });
  };

})();
