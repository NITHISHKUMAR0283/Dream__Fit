const mongoose = require("mongoose");

const dropLegacyVariantSkuIndex = async () => {
    try {
        const productsCollection = mongoose.connection.db.collection("products");
        const indexes = await productsCollection.indexes();
        const legacyIndex = indexes.find((index) => index.name === "variants.sku_1");

        if (legacyIndex) {
            await productsCollection.dropIndex("variants.sku_1");
            console.log("Dropped legacy index: variants.sku_1");
        }
    } catch (error) {
        if (String(error.message || "").includes("ns does not exist")) {
            return;
        }
        console.log(` Index cleanup warning: ${error.message}`);
    }
};

const connect = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not set in environment");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully");
        await dropLegacyVariantSkuIndex();
    } catch (err) {
        console.log(` Error : ${err.message}`);
        process.exit(1);
    }
};

module.exports = connect;
