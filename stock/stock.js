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

// 2. ROUTE UNTUK MENGAMBIL DATA PRODUK (Penting!)
app.get("/products", (req, res) => {
    res.json(products);
});

// Route dasar untuk cek server
app.get("/", (req, res) => {
    res.send("Backend Vercel Berjalan dengan Baik!");
});

// 3. EKSPOR UNTUK VERCEL (Penting!)
module.exports = app;

// Jalankan server jika dites di local (bukan di Vercel)
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}