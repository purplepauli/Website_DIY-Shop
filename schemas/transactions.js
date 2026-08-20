class Schema {

    constructor(id, timestamp, email, name, surname, cart, paymentMethod) {
        this.id = id;
        this.timestamp = timestamp;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.cart = cart;
        this.paymentMethod = paymentMethod;
        this.fulfilled = false;
    }

    validate() {
        const paymentMethods = ["visa", "mastercard", "paypal"];

        if (!(typeof this.id === "string")) return false;
        if (!(typeof this.timestamp === "number")) return false;
        if (!(typeof this.email == "string")) return false;
        if (!(typeof this.name === "string")) return false;
        if (!(typeof this.surname === "string")) return false;
        if ((typeof this.cart === "string") || !(Array.isArray(this.cart)) || this.cart.length < 1) return false;
        if (!(typeof this.paymentMethod === "string") || !paymentMethods.includes(this.paymentMethod)) return false;

        return true;
    }

    serialize() {
        if (!this.validate()) return false;

        return JSON.stringify({
            id: this.id,
            email: this.email,
            name: this.name,
            surname: this.surname,
            timestamp: this.timestamp,
            cart: this.cart, 
            paymentMethod: this.paymentMethod, 
            fulfilled: this.fulfilled
        }, null, 2);
    }

    static fromJSON(json) {
        return new Schema(
            json.id,
            json.timestamp,
            json.email,
            json.name,
            json.surname,
            json.cart, 
            json.paymentMethod, 
            json.fulfilled
        );
    }
}

module.exports = Schema;