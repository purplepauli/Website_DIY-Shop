// Warenkorb laden
cart = JSON.parse(localStorage.getItem('diyCart')) || [];

function renderCartPage() {
    const container = document.getElementById('cartContent');
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `
                <div class="cart-empty">
                    <p class="cart-empty-text">Dein Warenkorb ist aktuell leer.</p>
                    <a href="/" class="cart-link-primary">Zurück zum Shop</a>
                </div>
            `;
        return;
    }

    // Tabellen-Struktur für das Grid aufbauen
    let html = `
            <div class="cart-grid-header">
                <span>Produkt</span>
                <span class="cart-col-price">Einzelpreis</span>
                <span class="cart-col-qty">Anzahl</span>
                <span></span>
            </div>
        `;

    cart.forEach((item, index) => {
        const unitPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const imagePath = item.imagePath || '';
        total += unitPrice * quantity;
        html += `
            <div class="cart-row">
                <div class="cart-product">
                    <img src="${imagePath}" alt="${item.name}" class="cart-product-image" onerror="this.classList.add('is-hidden')">
                    <div class="cart-product-info">
                        <span class="cart-product-name">${item.name}</span>
                        ${item.variant ? `<span class="cart-product-variant">${item.variant}</span>` : ''}
                    </div>
                </div>
                <span class="cart-price">
                    ${unitPrice.toFixed(2).replace('.', ',')} €
                </span>
                <input type="number" min="1" value="${quantity}" onchange="updatePageQuantity(${index}, this.value)" class="cart-qty-input">
                <button onclick="removePageItem(${index})" class="cart-remove-btn">🗑️</button>
            </div>
        `;
    });

    // Gesamtsumme & Checkout Button
    html += `
            <div class="cart-summary">
                Gesamtsumme: <span class="cart-total-amount">${total.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div class="cart-actions">
                <a href="/" class="cart-link-secondary">Weiter einkaufen</a>
                <button onclick="checkout()" class="checkout-btn cart-checkout-btn">Zur Kasse</button>
            </div>
        `;

    container.innerHTML = html;
}

function updatePageQuantity(index, newQty) {
    const parsedQty = parseInt(newQty, 10);
    cart[index].quantity = Number.isNaN(parsedQty) || parsedQty < 1 ? 1 : parsedQty;
    localStorage.setItem('diyCart', JSON.stringify(cart));
    renderCartPage();
    if (typeof updateCartCounter === 'function') updateCartCounter();
}

function removePageItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('diyCart', JSON.stringify(cart));
    renderCartPage();
    if (typeof updateCartCounter === 'function') updateCartCounter();
}

//TODO remove
/*
function checkoutDummy() {
    cart.length = 0; // Leeren des Warenkorbs;
    localStorage.removeItem('diyCart'); // Entfernen des Warenkorbs aus dem localStorage
    renderCartPage();
    if (typeof updateCartCounter === 'function') updateCartCounter();
    alert('Dummy: Weiterleitung zum sicheren Bezahlvorgang...');
}
*/

function checkout() {
    location.href = '/bezahlen';
}


// Beim Laden der Seite direkt rendern
document.addEventListener('DOMContentLoaded', renderCartPage);