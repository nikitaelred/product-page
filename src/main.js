import "./style.css";
import { fetchProducts } from "./data.js";

//Declare variables
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const priceSlider = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const loader = document.getElementById("loader");

const cartModal = document.getElementById("cart-modal");
const wishlistModal = document.getElementById("wishlist-modal");

const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");

const wishlistItemsEl = document.getElementById("wishlist-items");
const wishlistCountEl = document.getElementById("wishlist-count");

const paginationEl = document.getElementById("pagination");
const PRODUCTS_PER_PAGE = 8;
let currentPage = 1;

let products = [];
let filteredProducts = [];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

//Save cart and wishlist data
function saveState() {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

//Update cart
function updateCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  if (cart.length !== 0) {
    cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const li = document.createElement("li");
      li.innerHTML = `
      ${item.name} - $${item.price} × 
      <button data-index="${index}" data-action="decrease"><i class="fas fa-minus"></i></button>
      ${item.quantity}
      <button data-index="${index}" data-action="increase"><i class="fas fa-plus"></i></button>
      = $${subtotal.toFixed(2)}
      <button data-index="${index}" class="remove"><i class="fas fa-trash"></i></button>
    `;
      cartItemsEl.appendChild(li);
    });
    cartTotalEl.textContent = total.toFixed(2);
    cartCountEl.textContent = cart.reduce((a, b) => a + b.quantity, 0);

    cartItemsEl.querySelectorAll("button").forEach((btn) => {
      const i = +btn.dataset.index;
      const action = btn.dataset.action;

      btn.addEventListener("click", () => {
        if (action === "increase") {
          cart[i].quantity++;
        } else if (action === "decrease" && cart[i].quantity > 1) {
          cart[i].quantity--;
        } else if (btn.classList.contains("remove")) {
          cart.splice(i, 1);
        }
        saveState();
        updateCart();
      });
    });
  } else {
    cartItemsEl.innerHTML =
      "<h3 style='text-align:center;'>Cart is empty.</h3>";
  }
}

//Update wishlist
function updateWishlist() {
  if (wishlist.length !== 0) {
    console.log(wishlist);
    wishlistItemsEl.innerHTML = "";
    wishlist.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
      ${item.name} - $${item.price}
      <button data-index="${index}" class="remove-wish"><i class="fas fa-trash"></i></button>
    `;
      wishlistItemsEl.appendChild(li);
    });
    wishlistCountEl.textContent = wishlist.length;

    wishlistItemsEl.querySelectorAll(".remove-wish").forEach((btn) => {
      const index = +btn.dataset.index;
      btn.addEventListener("click", () => {
        wishlist.splice(index, 1);
        saveState();
        updateWishlist();
        renderProducts(filteredProducts);
      });
    });
  } else {
    wishlistItemsEl.innerHTML =
      "<h3 style='text-align:center;'>Wishlist is empty.</h3>";
  }
}

//Render products
function renderProducts(list) {
  productList.innerHTML = "";
  filteredProducts = list;

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const paginated = list.slice(start, end);

  paginated.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "product";

    const inCart = cart.find((p) => p.name === prod.name);
    const inWish = wishlist.find((p) => p.name === prod.name);

    div.innerHTML = `
      <img src="${prod.image}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p>$${prod.price}</p>
      <p>${prod.category}</p>
      <button class="toggle-cart">${
        inCart
          ? '<i class="fas fa-cart-arrow-down"></i> Remove from Cart'
          : '<i class="fas fa-cart-plus"></i> Add to Cart'
      }</button>
      <button class="toggle-wish">${
        inWish
          ? '<i class="fas fa-heart-broken"></i> Remove Wishlist'
          : '<i class="far fa-heart"></i> Wishlist'
      }</button>
    `;

    const [cartBtn, wishBtn] = div.querySelectorAll("button");

    cartBtn.addEventListener("click", () => {
      const i = cart.findIndex((p) => p.name === prod.name);
      if (i !== -1) cart.splice(i, 1);
      else cart.push({ ...prod, quantity: 1 });
      saveState();
      updateCart();
      renderProducts(filteredProducts);
    });

    wishBtn.addEventListener("click", () => {
      const i = wishlist.findIndex((p) => p.name === prod.name);
      if (i !== -1) wishlist.splice(i, 1);
      else wishlist.push(prod);
      saveState();
      updateWishlist();
      renderProducts(filteredProducts);
    });
    div.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        window.location.href = `product.html?id=${prod.id}`;
      }
    });
    productList.appendChild(div);
  });

  renderPagination(list.length);
}

//Render pagination
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
  paginationEl.innerHTML = "";

  if (totalPages <= 1) return;

  const createBtn = (label, page) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (page === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = page;
      renderProducts(filteredProducts);
    });
    return btn;
  };

  if (currentPage > 1) {
    paginationEl.appendChild(createBtn("« Prev", currentPage - 1));
  }

  for (let i = 1; i <= totalPages; i++) {
    paginationEl.appendChild(createBtn(i, i));
  }

  if (currentPage < totalPages) {
    paginationEl.appendChild(createBtn("Next »", currentPage + 1));
  }
}

//Add categories to dropdown
function populateCategories() {
  categorySelect.innerHTML = '<option value="all">All</option>';
  const cats = [...new Set(products.map((p) => p.category))];
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.toLowerCase();
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });
}

//Filter Products
function filterProducts() {
  const search = searchInput.value.toLowerCase();
  const category = categorySelect.value;
  const maxPrice = +priceSlider.value;

  const list = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search) &&
      (category === "all" || p.category.toLowerCase() === category) &&
      p.price <= maxPrice
  );

  currentPage = 1;
  renderProducts(list);
}

searchInput.addEventListener("input", filterProducts);
categorySelect.addEventListener("change", filterProducts);
priceSlider.addEventListener("input", () => {
  priceValue.textContent = priceSlider.value;
  filterProducts();
});

//Toggle cart and wishlist modals
document.getElementById("toggle-cart").onclick = () =>
  (cartModal.style.display = "flex");
document.getElementById("toggle-wishlist").onclick = () =>
  (wishlistModal.style.display = "flex");
document
  .querySelectorAll(".close")
  .forEach(
    (btn) =>
      (btn.onclick = () => (btn.closest(".modal").style.display = "none"))
  );

//Initialize
async function init() {
  loader.style.display = "flex";
  try {
    products = await fetchProducts();
    populateCategories();
    filterProducts();
    updateCart();
    updateWishlist();
  } catch (err) {
    productList.innerHTML = "Failed to load products.";
    console.error(err);
  } finally {
    loader.style.display = "none";
  }
}

init();
