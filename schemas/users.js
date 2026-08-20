class Schema{

    constructor(name, surname, email, password, isAdmin){
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin || false;
    }

    validate(){
        if(!(typeof this.name === "string") || this.name.length < 1) return false;
        if(!(typeof this.surname === "string") || this.surname.length < 1) return false;
        if(!(typeof this.email === "string") || this.email.length < 1) return false;
        if(!(typeof this.password === "string") || this.password.length < 1) return false;

        return true;
    }

    serialize(){
        if(!this.validate()) return false;
        return JSON.stringify({name: this.name, email: this.email, surname: this.surname, password: this.password, isAdmin: this.isAdmin}, null, 2);
    }
}

module.exports = Schema;