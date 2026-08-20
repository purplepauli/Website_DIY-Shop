class Schema {

    constructor(id, title, category, tag, image, teaser, intro, difficulty, time) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.tag = tag;
        this.image = image;
        this.teaser = teaser;
        this.intro = intro;
        this.difficulty = difficulty; 
        this.time = time;
    }

    validate() {
        if (typeof this.title !== "string" || this.title.length < 1) return false;
        if (typeof this.category !== "string" || this.category.length < 1) return false;
        if (typeof this.tag !== "string" || this.tag.length < 1) return false;
        if (typeof this.image !== "string" || this.image.length < 1) return false;
        if (typeof this.teaser !== "string" || this.teaser.length < 1) return false;
        if (typeof this.intro !== "string" || this.intro.length < 1) return false;
        if (typeof this.difficulty !== "number" || this.difficulty < 1 || this.difficulty > 5) return false;
        if (typeof this.time !== "string" || this.time.length < 1) return false;

        return true;
    }

    serialize() {
        if (!this.validate()) return false;

        return JSON.stringify({
            id: this.id,
            title: this.title,
            category: this.category,
            tag: this.tag,
            image: this.image,
            teaser: this.teaser,
            intro: this.intro, 
            time: this.time, 
            difficulty: this.difficulty
        }, null, 2);
    }

    static fromJSON(json) {
        return new Schema(
            json.id,
            json.title,
            json.category,
            json.tag,
            json.image,
            json.teaser,
            json.intro, 
            json.time, 
            json.difficulty
        );
    }
}

module.exports = Schema;