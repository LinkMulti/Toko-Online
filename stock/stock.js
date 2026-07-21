const express = require("express");
const cors = require("cors");
const app = express();

// 1. IZINKAN CORS DARI NETLIFY
app.use(cors({
    origin: "*", // Mengizinkan semua domain mengakses API ini
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Data Dummy Stok & Harga
let products = [
    { id: "pulsator", price: 85000, stock: 10 },
    { id: "inlet_valve", price: 45000, stock: 5 },
    { id: "water_level_sensor", price: 35000, stock: 8 },
    { id: "backlight_tv", price: 75000, stock: 12 },
    { id: "power_board_tv", price: 180000, stock: 3 },
    { id: "speaker_woofer", price: 95000, stock: 15 },
    { id: "modul_bluetooth", price: 25000, stock: 20 }
];

// Endpoint GET Data Produk
app.get("/products", (req, res) => {
    res.json(products);
});

// Endpoint POST Beli / Potong Stok
app.post("/buy", (req, res) => {
    const { productId, qty } = req.body;
    const prod = products.find(p => p.id === productId);
    
    if (prod && prod.stock >= qty) {
        prod.stock -= qty;
        return res.json({ success: true, message: "Stok berhasil dipotong", stock: prod.stock });
    }
    
    res.status(400).json({ success: false, message: "Stok tidak mencukupi" });
});

// Export untuk Vercel Serverless Function
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});