// glow.js - Navbar, login/signup, cart, slider (works on all pages)

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const welcomeUser = document.getElementById("welcome-user");
  const cartCountEl = document.getElementById("cart-count");
  const userBtn = document.getElementById("user-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  // ----------------- CART COUNT -----------------
  let cartCount = parseInt(localStorage.getItem("cartCount")) || 0;
  if (cartCountEl) cartCountEl.textContent = cartCount;

  // ----------------- UPDATE NAVBAR -----------------
  function updateNavbar() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const userArea = document.querySelector(".user-area");
    if (loggedInUser) {
      if (welcomeUser) {
        welcomeUser.style.display = "inline-block";
        welcomeUser.textContent = loggedInUser;
      }
      if (loginBtn) loginBtn.style.display = "none";
      if (userArea) userArea.style.display = "flex";
    } else {
      if (welcomeUser) welcomeUser.style.display = "none";
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (userArea) userArea.style.display = "none";
    }
  }
  updateNavbar();

  // ----------------- LOGIN BUTTON -----------------
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  // ----------------- DROPDOWN MENU -----------------
  if (userBtn && dropdownMenu) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", () => {
      if (dropdownMenu) dropdownMenu.style.display = "none";
    });
    dropdownMenu.addEventListener("click", (e) => e.stopPropagation());
  }

  // ----------------- LOGOUT -----------------
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      alert("You have been logged out.");
      updateNavbar();
      window.location.href = "login.html";
    });
  }

  // ----------------- LOGIN FORM -----------------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const match = users.find(u => u.username === username && u.password === password);
      if (match) {
        localStorage.setItem("loggedInUser", username);
        alert("Login successful!");
        window.location.href = "glow.html"; // redirect home
      } else {
        alert("Invalid username or password");
      }
    });
  }

  // ----------------- SIGNUP FORM -----------------
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("signup-username").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      let users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
      }
      users.push({ username, password });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Signup successful! Please login.");
      signupForm.reset();
      document.querySelector("#login-form").scrollIntoView();
    });
  }

  // ----------------- ADD TO CART BUTTONS -----------------
  document.querySelectorAll(".crt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if (!loggedInUser) {
        if (confirm("Please login to add to cart. Go to login page?")) {
          window.location.href = "login.html";
        }
        return;
      }

      const prod = btn.closest(".grid_prod");
      if (!prod) return;
      const titleEl = prod.querySelector(".grid_price h2");
      const priceEl = prod.querySelectorAll(".grid_price p")[1] || prod.querySelector(".grid_price p");
      const title = titleEl ? titleEl.innerText.trim() : "Product";
      const price = priceEl ? parseInt(priceEl.innerText.replace(/[^0-9]/g, "")) : 0;

      let cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      cartItems.push({ title, price, qty: 1 });
      localStorage.setItem("cartItems", JSON.stringify(cartItems));

      cartCount++;
      localStorage.setItem("cartCount", cartCount);
      if (cartCountEl) cartCountEl.textContent = cartCount;
      alert(`${title} added to cart`);
    });
  });

  // ----------------- CART BUTTON -----------------
  const cartBtn = document.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if (!loggedInUser) {
        if (confirm("Please login to view cart. Go to login page?")) window.location.href = "login.html";
        return;
      }
      // Adjust the path to the cart page correctly
      window.location.href = "cart.html"; // <-- make sure this matches your file
    });
  }

  // ----------------- CART PAGE RENDER -----------------
  const cartContainer = document.getElementById("cart-items-list");
  if (cartContainer) {
    const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
    cartContainer.innerHTML = "";
    if (items.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      let total = 0;
      items.forEach((it, i) => {
        total += it.price * (it.qty || 1);
        const row = document.createElement("div");
        row.className = "cart-row";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "10px 0";
        row.innerHTML = `
          <div><strong>${it.title}</strong><div style="color:#666">Rs.${it.price}</div></div>
          <div>
            <button class="remove-btn" data-i="${i}" style="margin-right:8px">Remove</button>
            <span>Qty: ${it.qty || 1}</span>
          </div>`;
        cartContainer.appendChild(row);
      });
      const totalEl = document.getElementById("cart-total-amount");
      if (totalEl) totalEl.innerText = "Rs. " + total;
    }

    // REMOVE ITEM
    cartContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const i = parseInt(e.target.dataset.i);
        let arr = JSON.parse(localStorage.getItem("cartItems") || "[]");
        if (!isNaN(i) && arr[i]) {
          arr.splice(i, 1);
          localStorage.setItem("cartItems", JSON.stringify(arr));
          cartCount = Math.max(0, cartCount - 1);
          localStorage.setItem("cartCount", cartCount);
          if (cartCountEl) cartCountEl.textContent = cartCount;
          location.reload();
        }
      }
    });
  }

  // ----------------- HERO SLIDER -----------------
  const slider = document.querySelector(".slider");
  if (slider) {
    const slides = slider.querySelectorAll(".slide");
    let idx = 0;
    const total = slides.length;
    if (total > 1) {
      setInterval(() => {
        idx = (idx + 1) % total;
        slider.style.transform = `translateX(-${idx * 100}%)`;
      }, 4000);
    }
  }
});
