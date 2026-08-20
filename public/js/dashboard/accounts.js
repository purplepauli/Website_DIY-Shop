let confirmation = false;

async function deleteUser(btn){
    btn.disabled = true;

    const email = btn.getAttribute('data-id');
    const user = JSON.parse(btn.getAttribute('data-user'));

    if(email === user.email){
        if(!confirmation){
            confirmation = true;

            alert("Dies ist Dein eigenes Konto. Bitte drücke den Knopf noch einmal, wenn Du es wirklich löschen willst.");

            btn.disabled = false;
            return;
        }

        const success = await requestDeletion(btn, email);

        if(success){
            location.replace("/auth/logout");
        }

        return;
    }

    await requestDeletion(btn, email);
}


async function requestDeletion(btn, email){
    const list = document.getElementById("list-users");

    try {
        const res = await fetch(
            "/mitarbeiter/actions/deleteone/user/" + encodeURIComponent(email),
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if(res.ok){
            const row = list.querySelector(`[data-id="${email}"]`);

            if(row){
                row.remove();
            }

            showSuccess("Nutzer wurde erfolgreich gelöscht.");
            return true;
        }

        showError();
        btn.disabled = false;
        return false;

    } catch(err){
        console.error(err);

        showError();
        btn.disabled = false;
        return false;
    }
}


function showSuccess(msg){
    console.log(msg);
}


function showError(){
    console.log("Error");
}