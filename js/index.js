/* --- 1. GLOBAL STATE & LOCAL STORAGE --- */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* --- 2. CREATE CART UI --- */
const cartBox = document.createElement("div");
cartBox.id = "cartMainBox";
cartBox.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
    <h4 style="margin:0">🛒 My Cart</h4>
    <span id="closeCart" style="cursor:pointer;font-size:22px">&times;</span>
  </div>
  <div id="cart-items" style="max-height:300px; overflow-y:auto;"></div>
  <hr style="border:0; border-top:1px solid #444; margin:15px 0">
  <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:15px">
    <span>Total:</span>
    <span id="cart-total">$0</span>
  </div>
  <button id="checkoutBtn">Proceed to Checkout</button>
`;

cartBox.style.cssText = `
  position: fixed; right: 20px; bottom: 20px; width: 320px;
  background: #191919; color: white; padding: 20px; z-index: 9999;
  font-family: Arial; box-shadow: 0 10px 30px black; border-radius: 10px;
  display: none; border: 1px solid #333;
`;
document.body.appendChild(cartBox);

const checkBtn = document.getElementById("checkoutBtn");
checkBtn.style.cssText = `width: 100%; background: #d6fb00; border: none; padding: 12px; font-weight: bold; cursor: pointer; color: black; border-radius: 5px;`;

/* --- 3. CORE FUNCTIONS --- */

function renderCart() {
    const itemsBox = document.getElementById("cart-items");
    const totalBox = document.getElementById("cart-total");
    if (!itemsBox) return;

    itemsBox.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        itemsBox.innerHTML += `
            <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #333; padding-bottom: 5px;">
                <div style="font-size:14px">
                    <strong>${item.name}</strong><br>
                    <span style="color:#d6fb00">$${item.price} x ${item.qty}</span>
                </div>
                <div>
                    <button onclick="changeQty(${index}, 1)" style="cursor:pointer; padding:2px 5px">+</button>
                    <button onclick="changeQty(${index}, -1)" style="cursor:pointer; padding:2px 5px">-</button>
                </div>
            </div>`;
    });
    totalBox.innerText = "$" + total.toFixed(2);
}

window.changeQty = function(index, amount) {
    cart[index].qty += amount;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart();
};

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    if (cart.length === 0) cartBox.style.display = "none";
}

/* --- 4. MASTER PRICE LOGIC (Fixed for Membership & Classes) --- */

document.addEventListener("click", (e) => {
    const card = e.target.closest(".cor, .price .card, .car .card, .box .card, .btn");
    
    if (card) {
        let text = card.innerText;
        let name = text.split('\n')[0].trim(); 
        let price = 0;

        if (text.includes("One DAY PASS")) { price = 15; name = "One Day Pass"; }
        else if (text.includes("MONTHLY") && text.includes("40")) { price = 40; name = "Monthly Basic"; }
        else if (text.includes("MONTHLY") && text.includes("60")) { price = 60; name = "Monthly Pro"; }
        else if (text.includes("YEARLY")) { price = 90; name = "Yearly Membership"; }
        else if (text.includes("Boxing")) { price = 20; name = "Boxing Class"; }
        else if (text.includes("Yoga")) { price = 25; name = "Yoga Training"; }
        else if (text.includes("Outdoor")) { price = 30; name = "Outdoor Class"; }
        else {
    
            let match = text.match(/(\d+)\$/) || text.match(/\$(\d+)/);
            price = match ? Number(match[1] || match[2]) : 20;
        }

        let existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }

    
        card.style.transform = "scale(0.97)";
        setTimeout(() => { card.style.transform = "scale(1)"; }, 150);

        saveCart();
        cartBox.style.display = "block";
    }

    if (e.target.id === "closeCart") cartBox.style.display = "none";
});

/* --- 5. CHECKOUT & LOADER --- */

checkBtn.onclick = () => {
    if (cart.length === 0) return;
    alert("Payment Successful! ✅ Welcome to F7 Fitness.");
    cart = [];
    saveCart();
    cartBox.style.display = "none";
};

window.addEventListener("load", () => {
    renderCart();
    const loader = document.createElement("div");
    loader.id = "f7-loader";
    loader.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#191919;z-index:10000;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#d6fb00;font-family:Arial;transition: 0.5s;";
    loader.innerHTML = '<div class="spin"></div><p style="margin-top:15px; font-weight:bold;">LOADING F7 FITNESS...</p>';
    
    const s = document.createElement("style");
    s.innerHTML = ".spin { border: 4px solid #333; border-top: 4px solid #d6fb00; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
    document.head.appendChild(s);
    
    document.body.appendChild(loader);
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 500);
    }, 1500);
});