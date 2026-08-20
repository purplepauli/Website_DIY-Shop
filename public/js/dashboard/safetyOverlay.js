const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";
    } else {
        imagePreview.style.display = "none";
    }
});

document.getElementById("guideForm").addEventListener("submit", async e => {

    e.preventDefault();

    const formData = new FormData(e.target);


    const response = await fetch("/mitarbeiter/actions/create/safety", {
        method:"POST",
        body:formData
    });


    const data = await response.json();
    location.assign("/mitarbeiter/dashboard/sicherheitsratgeber");
});