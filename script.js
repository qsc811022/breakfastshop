var filterButtons = document.querySelectorAll(".filter-button");
var menuItems = document.querySelectorAll(".menu-item");
var orderCategoryTabs = document.getElementById("orderCategoryTabs");
var orderGrid = document.getElementById("orderGrid");
var orderPrevPage = document.getElementById("orderPrevPage");
var orderNextPage = document.getElementById("orderNextPage");
var orderPageInfo = document.getElementById("orderPageInfo");
var cartList = document.getElementById("cartList");
var cartTotal = document.getElementById("cartTotal");
var clearCart = document.getElementById("clearCart");
var cart = {};

var categoryLabels = {
  all: "全部",
  burger: "漢堡",
  sandwich: "三明治",
  toast: "吐司/厚片",
  omelet: "蛋餅",
  noodle: "鐵板麵",
  snack: "點心",
  drink: "飲料"
};

var orderState = {
  category: "all",
  page: 1,
  perPage: 12
};

var orderItems = Array.prototype.map.call(menuItems, function (item) {
  var priceText = item.querySelector(".price").textContent.trim();
  var priceMatch = priceText.match(/\d+/);

  return {
    category: item.getAttribute("data-category"),
    name: item.querySelector("h3").textContent.trim(),
    note: item.querySelector("p").textContent.trim(),
    priceText: priceText,
    price: priceMatch ? Number(priceMatch[0]) : 0
  };
});

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

function getFilteredOrderItems() {
  if (orderState.category === "all") {
    return orderItems;
  }

  return orderItems.filter(function (item) {
    return item.category === orderState.category;
  });
}

function renderOrderTabs() {
  var categories = Object.keys(categoryLabels);

  orderCategoryTabs.innerHTML = "";

  categories.forEach(function (category) {
    var button = document.createElement("button");
    var count = category === "all"
      ? orderItems.length
      : orderItems.filter(function (item) {
          return item.category === category;
        }).length;

    button.className = "order-category-button";
    button.type = "button";
    button.setAttribute("data-category", category);
    button.textContent = categoryLabels[category] + " " + count;

    if (orderState.category === category) {
      button.classList.add("active");
    }

    orderCategoryTabs.appendChild(button);
  });
}

function renderOrderItems() {
  var filteredItems = getFilteredOrderItems();
  var totalPages = Math.max(1, Math.ceil(filteredItems.length / orderState.perPage));

  if (orderState.page > totalPages) {
    orderState.page = totalPages;
  }

  var start = (orderState.page - 1) * orderState.perPage;
  var visibleItems = filteredItems.slice(start, start + orderState.perPage);

  orderGrid.innerHTML = "";

  visibleItems.forEach(function (item) {
    var button = document.createElement("button");
    var content = document.createElement("span");
    var name = document.createElement("span");
    var note = document.createElement("small");
    var price = document.createElement("strong");

    button.className = "order-card";
    button.type = "button";
    button.setAttribute("data-name", item.name);
    button.setAttribute("data-price", item.price);

    content.className = "order-card-copy";
    name.textContent = item.name;
    note.textContent = item.note;
    price.textContent = item.priceText.replace("起", "");

    content.appendChild(name);
    content.appendChild(note);
    button.appendChild(content);
    button.appendChild(price);
    orderGrid.appendChild(button);
  });

  orderPageInfo.textContent = "第 " + orderState.page + " / " + totalPages + " 頁";
  orderPrevPage.disabled = orderState.page === 1;
  orderNextPage.disabled = orderState.page === totalPages;
}

function renderOrderPanel() {
  renderOrderTabs();
  renderOrderItems();
}

orderCategoryTabs.addEventListener("click", function (event) {
  if (!event.target.classList.contains("order-category-button")) {
    return;
  }

  orderState.category = event.target.getAttribute("data-category");
  orderState.page = 1;
  renderOrderPanel();
});

orderGrid.addEventListener("click", function (event) {
  var card = event.target.closest(".order-card");

  if (!card) {
    return;
  }

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

orderPrevPage.addEventListener("click", function () {
  if (orderState.page <= 1) {
    return;
  }

  orderState.page -= 1;
  renderOrderItems();
});

orderNextPage.addEventListener("click", function () {
  var totalPages = Math.max(1, Math.ceil(getFilteredOrderItems().length / orderState.perPage));

  if (orderState.page >= totalPages) {
    return;
  }

  orderState.page += 1;
  renderOrderItems();
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
    cartList.innerHTML = '<li class="empty">尚未加入品項</li>';
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

renderOrderPanel();
