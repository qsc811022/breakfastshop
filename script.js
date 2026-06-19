var filterButtons = document.querySelectorAll(".filter-button");
var menuItems = document.querySelectorAll(".menu-item");
var orderCards = document.querySelectorAll(".order-card");
var cartList = document.getElementById("cartList");
var cartTotal = document.getElementById("cartTotal");
var clearCart = document.getElementById("clearCart");
var cart = {};

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var filter = button.getAttribute("data-filter");

    filterButtons.forEach(function (item) {
      item.classList.remove("active");
    });
    button.classList.add("active");

    menuItems.forEach(function (item) {
      var category = item.getAttribute("data-category");
      item.style.display = filter === "all" || filter === category ? "flex" : "none";
    });
  });
});

orderCards.forEach(function (card) {
  card.addEventListener("click", function () {
    var name = card.getAttribute("data-name");
    var price = Number(card.getAttribute("data-price"));

    if (!cart[name]) {
      cart[name] = {
        price: price,
        qty: 0
      };
    }

    cart[name].qty += 1;
    renderCart();
  });
});

clearCart.addEventListener("click", function () {
  cart = {};
  renderCart();
});

function changeQty(name, amount) {
  if (!cart[name]) {
    return;
  }

  cart[name].qty += amount;

  if (cart[name].qty <= 0) {
    delete cart[name];
  }

  renderCart();
}

function renderCart() {
  var names = Object.keys(cart);
  var total = 0;

  cartList.innerHTML = "";

  if (names.length === 0) {
    cartList.innerHTML = '<li class="empty">尚未加入餐點</li>';
    cartTotal.textContent = "$0";
    return;
  }

  names.forEach(function (name) {
    var item = cart[name];
    var subtotal = item.price * item.qty;
    total += subtotal;

    var li = document.createElement("li");
    li.className = "cart-row";
    li.innerHTML =
      '<div><strong>' +
      name +
      '</strong><br><small>$' +
      item.price +
      " x " +
      item.qty +
      '</small><div class="qty-controls"><button class="qty-button" type="button" data-name="' +
      name +
      '" data-change="-1">-</button><span>' +
      item.qty +
      '</span><button class="qty-button" type="button" data-name="' +
      name +
      '" data-change="1">+</button></div></div><strong>$' +
      subtotal +
      "</strong>";

    cartList.appendChild(li);
  });

  cartTotal.textContent = "$" + total;
}

cartList.addEventListener("click", function (event) {
  if (!event.target.classList.contains("qty-button")) {
    return;
  }

  var name = event.target.getAttribute("data-name");
  var amount = Number(event.target.getAttribute("data-change"));
  changeQty(name, amount);
});
