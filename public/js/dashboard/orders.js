async function deleteOrder(btn) {
    btn.disabled = true;

    const id = btn.getAttribute("data-id");

    const listOutstanding = document.getElementById("list-orders-outstanding");
    const listFulfilled = document.getElementById("list-orders-fullfilled");

    try {
        const res = await fetch(
            "/mitarbeiter/actions/deleteone/transaction/" + encodeURIComponent(id),
            {
                method: "DELETE"
            }
        );

        if (res.ok) {
            const row = listOutstanding?.querySelector(`[data-id="${id}"]`);
            const row2 = listFulfilled?.querySelector(`[data-id="${id}"]`);

            row?.remove();
            row2?.remove();

            return location.reload();;
        }

        showError();
    } catch (err) {
        console.error(err);
        showError();
    }

    btn.disabled = false;
    return false;
}

async function fulfillOrder(btn) {
    btn.disabled = true;

    const id = btn.getAttribute("data-id");

    try {
        const res = await fetch(
            "/mitarbeiter/actions/updateone/transaction/" + encodeURIComponent(id),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fulfilled: true
                })
            }
        );

        if (res.ok) {
            location.reload();
            return true;
        }

        showError();
    } catch (err) {
        console.error(err);
        showError();
    }

    btn.disabled = false;
    return false;
}

function showError() {
    console.log("Error");
}