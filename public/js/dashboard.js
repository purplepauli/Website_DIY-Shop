

const splashText = document.getElementById('splashText');

let page = document.getElementById('dashboard').dataset.page;

document.querySelectorAll(".sidebar__link").forEach((item) => {
    item.classList.remove("is-active");
    if(item.dataset.link === page) item.classList.add("is-active");
});

let pageName;

switch (page) {
    case "safety": 
        pageName = "Sicherheitsratgeber"
        break;
    case "products":
        pageName = "Produkte"
        break;
    case "accounts":
        pageName = "Accounts"
        break;
    case "orders":
        pageName = "Bestellungen"
        break;
    case "guides":
        pageName = "Guides"
        break;
    default:
        pageName = "Übersicht"
        break;
}

splashText.innerText = pageName;
