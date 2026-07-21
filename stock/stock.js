const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(express.json());

// Hubungkan ke Cloud Database Aiven
const db = mysql.createConnection({
    host: 'mysql-2f3b4956-umkm-multi.b.aivencloud.com',
    port: 26291,
    user: 'avnadmin',
    password: process.env.DB_PASSWORD, // 👈 Password aman dari Environment Variable
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) {
        console.error('Gagal terhubung ke MySQL Aiven Online:', err.message);
        return;
    }
    console.log('Terhubung ke database Cloud MySQL Aiven Berhasil!');
});

// ==========================================
// API 1: Mengambil semua data produk beserta stoknya
// ==========================================
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==========================================
// API 2: Mengurangi stok 1 unit (Hubungi Penjual)
// ==========================================
app.post('/api/buy', (req, res) => {
    const { productId } = req.body;
    
    db.query('SELECT stock FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0 && results[0].stock > 0) {
            db.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [productId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: 'Stok berhasil dikurangi di database!' });
            });
        } else {
            res.status(400).json({ success: false, message: 'Maaf, stok barang ini sudah habis!' });
        }
    });
});

// ==========================================
// API 3: ADMIN MENGUBAH HARGA DAN STOK BARANG
// ==========================================
app.post('/api/update-stock', (req, res) => {
    const { productId, stock, price } = req.body;
    const query = "UPDATE products SET stock = ?, price = ? WHERE id = ?"; 
    
    db.query(query, [stock, price, productId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Stok dan Harga berhasil diperbarui!" });
    });
});

// ==========================================
// 🆕 API 4: KONFIRMASI PEMBAYARAN TRANSFER (STOK OTOMATIS BERKURANG)
// ==========================================
app.post('/api/konfirmasi-pembayaran', (req, res) => {
    const { productId, qty } = req.body; // qty = jumlah barang yang dibeli
    const jumlahBeli = parseInt(qty) || 1;

    db.query('SELECT stock FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0 && results[0].stock >= jumlahBeli) {
            // Kurangi stok sebanyak jumlah pembeliannya
            db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [jumlahBeli, productId], (err) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, message: 'Pembayaran Dikonfirmasi! Stok berhasil dikurangi otomatis.' });
            });
        } else {
            res.status(400).json({ success: false, message: 'Gagal! Stok barang tidak mencukupi.' });
        }
    });
});

// ==========================================
// 🆕 API 5: INPUT NO RESI J&T EXPRESS
// ==========================================
app.post('/api/update-resi', (req, res) => {
    const { orderId, resiJNT } = req.body;
    
    // Nanti bisa dikembangkan untuk disimpan ke tabel orders/transaksi di database
    console.log(`Pesanan ${orderId} diupdate dengan Resi J&T: ${resiJNT}`);
    
    res.json({ 
        success: true, 
        message: `Resi J&T (${resiJNT}) berhasil dikirim untuk pesanan ${orderId}!` 
    });
});

// Menjalankan server backend
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Backend berjalan aktif di port ${PORT}`);
});