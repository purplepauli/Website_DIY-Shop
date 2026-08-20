function logWarning(msg) {
    const yellow = "\x1b[33m";
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";

    console.log(
        `${bold}${yellow}\n⚠️  ${msg}  ⚠️\n${reset}`
    );
}

function logSuccess(msg) {
    const green = "\x1b[32m";
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";

    console.log(
        `${bold}${green}\n✅  ${msg}  ✅\n${reset}`
    );
}

module.exports = { logWarning, logSuccess };