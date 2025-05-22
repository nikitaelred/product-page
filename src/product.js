import "./style.css";
import { fetchProduct } from "./data.js";
import { getCart, saveCart } from "./cart.js";

const productContainer = document.getElementById("product-detail");
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {
  try {
    let product = await fetchProduct(productId);
    const cart = getCart();
    const cartItem = cart.find((item) => item.id === product.id);
    const inCart = !!cartItem;

    productContainer.innerHTML = `
      <div class="product-full">
        <img src="${product.image}" alt="${product.name}" />
        <div class="info">
          <h2>${product.name}</h2>
          <p class="price">$${product.price}</p>
          <p>${product.description}</p>
          <p><strong>Category:</strong> ${product.category}</p>

          <label for="quantity">Quantity:</label>
          <input type="number" id="quantity" min="1" value="${cartItem ? cartItem.quantity : 1}" />

          <div class="buttons">
            <button id="cart-btn">
              ${inCart ? "Update Cart" : "Add to Cart"}
            </button>
            <button id="go-to-cart" style="margin-left: 10px;">
              Go to Cart
            </button>
          </div>

          <p id="feedback-msg" style="color: green; margin-top: 10px;"></p>
        </div>
      </div>
    `;

    document.getElementById("cart-btn").addEventListener("click", () => {
      const quantity = Math.max(1, parseInt(document.getElementById("quantity").value, 10));
      toggleCart(product, quantity);
    });

    document.getElementById("go-to-cart").addEventListener("click", () => {
      window.location.href = "index.html#cart"; // or any cart page/modal anchor you use
    });

  } catch (err) {
    productContainer.innerHTML = `<p>Error loading product.</p>${err}`;
  }
}

function toggleCart(product, quantity) {
  let cart = getCart();
  const index = cart.findIndex((p) => p.id === product.id);

  if (index !== -1) {
    cart[index].quantity = quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);

  const msg = document.getElementById("feedback-msg");
  msg.textContent = "Cart updated successfully!";
  setTimeout(() => (msg.textContent = ""), 2000);

  loadProduct(); // optional re-render
}

loadProduct();
