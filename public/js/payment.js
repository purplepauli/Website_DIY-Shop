let cart = JSON.parse(localStorage.getItem("diyCart")) || [];


function renderCheckout() {

    const container = document.getElementById("checkoutItems");
    const totalElement = document.getElementById("checkoutTotal");

    let total = 0;


    if(cart.length === 0){

        container.innerHTML = `
            <p>
                Dein Warenkorb ist leer.
            </p>
        `;

        location.replace("/");
        return; 
    }


    container.innerHTML = cart.map(item => {

        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;

        total += price * qty;


        return `
            <div class="checkout-item">

                <span>
                    ${item.name}
                    ${item.variant ? "(" + item.variant + ")" : ""}
                    x${qty}
                </span>

                <span>
                    ${(price * qty)
                        .toFixed(2)
                        .replace(".", ",")} €
                </span>

            </div>
        `;

    }).join("");

    totalElement.textContent = total.toFixed(2).replace(".", ",") + " €";
}


document.getElementById("payButton").addEventListener("click", async () => {
    const selected = document.querySelector("input[name='payment']:checked");

    if(!selected) return alert("Bitte wähle eine Zahlungsmethode aus.");

    const finalCart = JSON.parse(localStorage.getItem("diyCart")) || [];

    if(finalCart.length < 1) return alert("Dein Warenkorb ist leer.");

    const req = await fetch("/bezahlen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: selected.value, cart: finalCart })
    });


    if(!req.ok) return alert("Bezahlen fehlgeschlagen.");

    // Clear cart
    localStorage.removeItem("diyCart");

    // Display success section
    document.getElementById("paymentSection").classList.add("hidden");
    document.getElementById("cartSection").classList.add("hidden");
    document.getElementById("payment-heading").innerText = "Zahlung erfolgreich";
    document.getElementById("successSection").classList.remove("hidden");
});



document.addEventListener("DOMContentLoaded", renderCheckout);