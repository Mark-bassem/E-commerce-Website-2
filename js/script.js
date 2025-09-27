document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded");

  /* -------------------------------
     NAVBAR TOGGLE
  -------------------------------- */
  const bar = document.getElementById("bar");
  const nav = document.getElementById("navbar");
  const close = document.getElementById("close");

  if (bar && nav)
    bar.addEventListener("click", () => nav.classList.add("active"));
  if (close && nav)
    close.addEventListener("click", () => nav.classList.remove("active"));

  /* -------------------------------
     CART LOGIC
  -------------------------------- */
  const CART_KEY = "ecom_cart_v1";

  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  };

  const addToCart = (product) => {
    const cart = readCart();
    const existing = cart.find((i) => i.id === product.id);

    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      cart.push({ ...product, quantity: product.quantity || 1 });
    }
    saveCart(cart);
    alert(`${product.name} added to cart!`);
  };

  const removeFromCart = (index) => {
    const cart = readCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
  };

  const updateQty = (index, qty) => {
    const cart = readCart();
    cart[index].quantity = Math.max(1, parseInt(qty) || 1);
    saveCart(cart);
    renderCart();
  };

  const cartSubtotal = () =>
    readCart().reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const updateCartCount = () => {
    const total = readCart().reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = total;
    });
  };

  /* -------------------------------
     RENDER CART PAGE
  -------------------------------- */
  const renderCart = () => {
    const cartTableBody = document.querySelector("#cart tbody");
    if (!cartTableBody) return;

    const cart = readCart();
    cartTableBody.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const price = Number(item.price);
      const subtotal = price * item.quantity;
      total += subtotal;

      cartTableBody.insertAdjacentHTML(
        "beforeend",
        `
      <tr>
        <td><button class="remove" data-index="${index}">
          <i class="far fa-times-circle"></i>
        </button></td>
        <td><img src="${item.image}" width="60"></td>
        <td>${item.name}</td>
        <td>$${price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" 
            data-index="${index}" class="quantity">
        </td>
        <td>$${subtotal.toFixed(2)}</td>
      </tr>
    `
      );
    });

    // Update subtotal
    const subtotalBox = document.querySelector("#subtotal table");
    if (subtotalBox) {
      subtotalBox.innerHTML = `
        <tr><td>Cart Subtotal</td><td>$${total.toFixed(2)}</td></tr>
        <tr><td>Shipping</td><td>Free</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>$${total.toFixed(
          2
        )}</strong></td></tr>
      `;
    }

    // Attach listeners
    cartTableBody
      .querySelectorAll(".remove")
      .forEach((btn) =>
        btn.addEventListener("click", () => removeFromCart(btn.dataset.index))
      );

    cartTableBody
      .querySelectorAll(".quantity")
      .forEach((input) =>
        input.addEventListener("change", () =>
          updateQty(input.dataset.index, input.value)
        )
      );
  };

  /* -------------------------------
     SHOP PAGE
  -------------------------------- */
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cart")) {
      e.preventDefault();
      const btn = e.target.closest(".cart");

      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        image: btn.dataset.image,
        quantity: 1,
      };

      addToCart(product);
    }
  });

  /* -------------------------------
     PRODUCTS
  -------------------------------- */
  const renderProductCard = (p) => {
    const div = document.createElement("div");
    div.className = "pro";
    div.innerHTML = `
      <a href="product-info.html">
        <img src="${p.img}" alt="${p.name}">
      </a>
      <div class="des">
        <span>${p.brand}</span>
        <h5>${p.name}</h5>
        <h4>${p.price}</h4>
      </div>
      <a href="#"
         class="cart"
         data-id="${p.id}"
         data-name="${p.name}"
         data-price="${parseFloat(p.price.replace(/[^0-9.]/g, ""))}"
         data-image="${p.img}"
         aria-label="Add ${p.name} to cart">
        <i class="fa-solid fa-cart-shopping"></i>
      </a>
    `;
    return div;
  };

  // For shop.html → load all products into #main
  const loadShopProducts = async () => {
    try {
      const res = await fetch("data/products.json");
      const products = await res.json();

      const mainContainer = document.querySelector("#main .pro-container");
      if (!mainContainer) return;

      mainContainer.innerHTML = "";
      products.forEach((p) => {
        mainContainer.appendChild(renderProductCard(p));
      });
    } catch (err) {
      console.error("Failed to load shop products:", err);
    }
  };

  // For index.html → featured + arrivals
  const loadProductsSections = async () => {
    try {
      const res = await fetch("data/products.json");
      const products = await res.json();

      const featuredContainer = document.querySelector(".featured-container");
      const arrivalsContainer = document.querySelector(".arrivals-container");

      if (featuredContainer) {
        featuredContainer.innerHTML = "";
        products
          .filter((p) => p.id.startsWith("f"))
          .forEach((p) => featuredContainer.appendChild(renderProductCard(p)));
      }

      if (arrivalsContainer) {
        arrivalsContainer.innerHTML = "";
        products
          .filter((p) => p.id.startsWith("n"))
          .forEach((p) => arrivalsContainer.appendChild(renderProductCard(p)));
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  /* -------------------------------
     BLOGS
  -------------------------------- */
  const loadBlogs = async (containerSelector, jsonPath = "data/blogs.json") => {
    try {
      const res = await fetch(jsonPath);
      const blogs = await res.json();
      const container = document.querySelector(containerSelector);
      if (!container) return;

      container.innerHTML = "";

      blogs.forEach((b) => {
        const div = document.createElement("div");
        div.className = "blog-card";
        div.innerHTML = `
          <img src="${b.img}" alt="${b.title}">
          <div class="content">
            <h3>${b.title}</h3>
            <small>${new Date(b.date).toLocaleDateString()}</small>
            <p>${b.excerpt}</p>
            <a href="#">Read More</a>
          </div>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load blogs:", err);
    }
  };

  /* -------------------------------
     INIT
  -------------------------------- */
  updateCartCount();
  if (document.querySelector("#cart tbody")) renderCart();
  if (document.querySelector("#main .pro-container")) {
    loadShopProducts();
  } else if (
    document.querySelector(".featured-container, .arrivals-container")
  ) {
    loadProductsSections();
  }
  if (document.querySelector(".blogs-container")) loadBlogs(".blogs-container");
});
