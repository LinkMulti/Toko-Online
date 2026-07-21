const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

let products = [
    { id: "pulsator", price: 85000, stock: 10 },
    { id: "inlet_valve", price: 45000, stock: 5 },
    { id: "water_level_sensor", price: 35000, stock: 8 },
    { id: "backlight_tv", price: 75000, stock: 12 },
    { id: "power_board_tv", price: 180000, stock: 3 },
    { id: "speaker_woofer", price: 95000, stock: 15 },
    { id: "modul_bluetooth", price: 25000, stock: 20 }
];

// GET All Products
app.get("/products", (req, res) => res.json(products));

// PUT Update Product
app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { price, stock } = req.body;
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        if (price !== undefined) products[index].price = Number(price);
        if (stock !== undefined) products[index].stock = Number(stock);
        return res.json({ success: true, product: products[index] });
    }
    res.status(404).json({ success: false, message: "Not found" });
});

module.exports = app;