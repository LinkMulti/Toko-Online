const express = require("express");
const cors = require("cors");
const app = express();

// 1. CORS CONFIGURATION
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// 2. DATA PRODUCTS DUMMY
let products = [
    { id: "pulsator", price: 85000, stock: 10 },
    { id: "inlet_valve", price: 45000, stock: 5 },
    { id: "water_level_sensor", price: 35000, stock: 8 },
    { id: "backlight_tv", price: 75000, stock: 12 },
    { id: "power_board_tv", price: 180000, stock: 3 },
    { id: "speaker_woofer", price: 95000, stock: 15 },
    { id: "modul_bluetooth", price: 25000, stock: 20 }
];

// GET: Ambil Semua Produk
app.get("/products", (req, res) => {
    res.json(products);
});

// PUT: Update Stok/Harga dari Admin Panel
app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { price, stock } = req.body;
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        if (price !== undefined) products[index].price = Number(price);
        if (stock !== undefined) products[index].stock = Number(stock);
        return res.json({ success: true, product: products[index] });
    }
    res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
});

// POST: Potong Stok Saat Pembeli Checkout
app.post("/buy", (req, res) => {
    const { productId, qty } = req.body;
    const amount = Number(qty) || 1;
    const index = products.findIndex(p => p.id === productId);

    if (index !== -1) {
        if (products[index].stock >= amount) {
            products[index].stock -= amount;
            return res.json({ success: true, product: products[index] });
        }
        return res.status(400).json({ success: false, message: "Stok habis!" });
    }
    res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
});

module.exports = app;