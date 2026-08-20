const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const { logWarning, logSuccess } = require("./logger.js");

const envPath = path.join(__dirname, "../../.env");

const VARIABLES = [
    {
        name: "JWT_SECRET",
        comment: "# JWT signing secret (auto-generated)",
        generate: () => crypto.randomBytes(64).toString("hex"),
        validate: value => value.length >= 64
    },
    {
        name: "PASSWORD_PEPPER",
        comment: "# Password hashing pepper (auto-generated)",
        generate: () => crypto.randomBytes(64).toString("hex"),
        validate: value => value.length >= 64
    }
];


function initializeEnv() {
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, "", "utf8");
        logWarning(".env did not exist. Created it.");
    }

    let content = fs.readFileSync(envPath, "utf8");

    for (const variable of VARIABLES) {
        content = ensureVariable(content, variable);
    }

    fs.writeFileSync(
        envPath,
        content.trimEnd() + "\n",
        "utf8"
    );

    logSuccess(".env is configured correctly.");
    logWarning("Keep this file private and never commit it.");
}


function ensureVariable(content, variable) {
    const regex = new RegExp(
        `^${variable.name}=.*$`,
        "m"
    );

    const match = content.match(regex);

    if (match) {
        const value = match[0]
            .substring(variable.name.length + 1)
            .trim();

        if (variable.validate(value)) {
            logSuccess(`${variable.name} already exists.`);
            return content;
        }

        logWarning(`${variable.name} is invalid. Regenerating...`);

        content = removeVariable(content, variable.name);
    } else {
        logWarning(`${variable.name} missing. Generating...`);
    }

    const generated = [
        variable.comment,
        `${variable.name}=${variable.generate()}`
    ].join("\n");


    return content.trimEnd() + "\n\n" + generated;
}


function removeVariable(content, name) {
    const lines = content
        .split("\n")
        .filter(line => !line.startsWith(`${name}=`));

    return lines.join("\n");
}

module.exports = { initializeEnv };