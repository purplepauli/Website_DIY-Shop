const e = require('express');
const { constants } = require('node:buffer');
const fs = require('node:fs');
const path = require('path');

const modelPath = path.join(__dirname, "../models");
const schemaPath = path.join(__dirname, "../schemas")


function hasMethod(obj, name) {
    return typeof obj?.[name] === "function";
}


// this function returns a class reference of a schema or false
function getSchemaIfExists(modelName){
    const p = path.join(schemaPath, `${modelName}.js`)
    if(!fs.existsSync(p)) return {err: "Schema file does not exist!"};;

    try {
        const c = require(p);

        if(c == undefined) return {err: "Schema is undefined!"};; 

        if(!hasMethod(c.prototype, "validate")) return {err: "Schema provides no validate method!"};
        if(!hasMethod(c.prototype, "serialize")) return {err: "Schema provides no serialize method!"};

        return { err: null, class: c};
    } catch (err) {
        return { err };
    }
}


function appendFileOrCreate(filePath, content) {
    let arr = [];

    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        if (raw.length > 0) {
            arr = JSON.parse(raw);
        }
    }

    const obj = JSON.parse(content);

    arr.push(obj);

    fs.writeFileSync(
        filePath,
        JSON.stringify(arr, null, 2),
        "utf8"
    );
}

function add(modelName, instance){    
    const schema = getSchemaIfExists(modelName);

    if(schema.err) return {success: false, msg: `Schema ${modelName} does not exist!`, err: schema.err};

  
    if(!(instance instanceof schema.class)) return {success: false, msg: "The provided instance is not of type schema!"};

    try {
        const content = instance.serialize();
        if(!content) return {success: false, msg: "The serialize method could not produce json as validation failed"};

        appendFileOrCreate(path.join(modelPath, `${modelName}.json`), content);

        return {success: true, msg: null};
    } catch (err) {
        return {success: false, msg: "Unexpected error.", err};
    }
}

function getModelFilePath(modelName){
    return path.join(modelPath, `${modelName}.json`);
}

function get(modelName, key, value){

    const modelFilePath = getModelFilePath(modelName);

    if(!fs.existsSync(modelFilePath)) return {success: false, msg: `Model file ${modelName}.json does not exist!`}


    const raw = fs.readFileSync(modelFilePath, {encoding: "utf8"});
    let data = [];

    try {
        data = JSON.parse(raw);
    } catch (err) {
        return {success: false, msg: `Model file ${modelName}.json contains invalid json.`, err};
    }


    const res = data.find((entry) => {
        return entry[key] === value;
    })

    if(!res) return {success: true, exists: false, msg: `No entry has key ${key} of value ${value}!`};

    return {success: true, exists: true, data: res}
}   

function getAll(modelName){
    const modelFilePath = getModelFilePath(modelName);
    if(!fs.existsSync(modelFilePath)) return {success: false, msg: `Model file ${modelName}.json does not exist!`}

    const raw = fs.readFileSync(modelFilePath, {encoding: "utf8"});
    let data = [];

    try {
        data = JSON.parse(raw);
    } catch (err) {
        return {success: false, msg: `Model file ${modelName}.json contains invalid json.`, err};
    }

    return {success: true, data};
}

function deleteOne(modelName, key, value) {
    const modelFilePath = getModelFilePath(modelName);
    if (!fs.existsSync(modelFilePath)) {
        return { success: false, msg: `Model file ${modelName}.json does not exist!` };
    }

    const raw = fs.readFileSync(modelFilePath, { encoding: "utf8" });
    let data = [];

    try {
        data = JSON.parse(raw);
    } catch (err) {
        return { success: false, msg: `Model file ${modelName}.json contains invalid json.`, err };
    }

    const index = data.findIndex((entry) => {
        return entry[key] === value;
    });

    if (index === -1) {
        return { success: false, msg: `No entry has key ${key} of value ${value}!` };
    }

    data.splice(index, 1);

    fs.writeFileSync(
        modelFilePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    return { success: true, msg: null };
}

function updateOne(modelName, key, value, updateData) {
    const modelFilePath = getModelFilePath(modelName);

    if (!fs.existsSync(modelFilePath)) {
        return { success: false, msg: `Model file ${modelName}.json does not exist!` };
    }

    const raw = fs.readFileSync(modelFilePath, { encoding: "utf8" });
    let data = [];

    try {
        data = JSON.parse(raw);
    } catch (err) {
        return { success: false, msg: `Model file ${modelName}.json contains invalid json.`, err };
    }

    const index = data.findIndex((entry) => {
        return entry[key] === value;
    });

    if (index === -1) {
        return { success: false, msg: `No entry has key ${key} of value ${value}!` };
    }

    Object.keys(updateData).forEach((field) => {
        if (updateData[field] !== undefined) {
            data[index][field] = updateData[field];
        }
    });

    fs.writeFileSync(
        modelFilePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    return { success: true, msg: null, data: data[index] };
}

module.exports = { add, get, getAll, deleteOne, updateOne };