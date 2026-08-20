const fs = require("fs/promises"); 
const path = require("path");
const PRODUCT_PATH = "./database/products";

async function findProducts(id = "*") {
    try {
        const files = await fs.readdir(PRODUCT_PATH);

        const jsonFiles = files.filter(file => path.extname(file) === ".json");

        const results = await Promise.all(
            jsonFiles.map(async (file) => {
                const filePath = path.join(PRODUCT_PATH, file);

                try {
                    const content = await fs.readFile(filePath, "utf-8");
                    return JSON.parse(content);
                } catch (err) {
                    console.error(`Error reading/parsing ${file}:`, err);
                    return null; // skip broken JSON files
                }
            })
        );

        if(id === "*") return results;
        else return results.find((name) => name === id)

    } catch (err) {
        console.error("Error reading directory:", err);
        return [];
    }
}

module.exports = findProducts;