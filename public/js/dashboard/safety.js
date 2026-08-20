// Delete
const deleteButtons = document.querySelectorAll(".btn--delete");

deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
        btn.disabled = true;

        const row = btn.closest(".list-row");
        const id = row.dataset.id;


        try {
            const response = await fetch(`/mitarbeiter/actions/deleteone/safety/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                btn.disabled = false;
                return showError();
            }

            row.remove();

            updateCountHeading();

            showSuccess("Ratgeber wurde erfolgreich gelöscht.");

        } catch (err) {
            console.error(err);
            btn.disabled = false;
            showError();
        }
    });
});

function updateCountHeading() {
    const count = document.querySelectorAll(".list-row").length;
    const heading = document.getElementById("guideCountHeading");

    heading.textContent =
        count === 1
            ? "Es gibt einen Sicherheitsratgeber"
            : `Es gibt ${count} Sicherheitsratgeber`;
}

function showError() {
    console.log("Fehler beim Löschen.");
}

function showSuccess(msg) {
    console.log(msg);
}