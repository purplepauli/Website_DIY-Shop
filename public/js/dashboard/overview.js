function setStatusDot(color) {
    const dot = document.getElementById("statusDot");

    const allowedColors = ["red", "orange", "green"];

    if (!allowedColors.includes(color)) {
        console.warn(`Invalid status color: ${color}`);
        return;
    }

    // Remove existing color classes
    dot.classList.remove(...allowedColors);

    // Apply new color
    dot.classList.add(color);
}

// Example usage:
setStatusDot("green");