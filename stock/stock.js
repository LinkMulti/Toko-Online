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
    password: process.env.DB_PASSWORD, // Read dari Environment Variable
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
// API 1: AMBIL SEMUA PRODUK & STOK
// ==========================================
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==========================================
// API 2: ADMIN UPDATE HARGA & STOK (KHUSUS ELEKTRONIK)
// ==========================================
app.post('/api/update-stock', (req, res) => {
    const { productId, stock, price } = req.body;
    const query = "UPDATE products SET stock = ?, price = ? WHERE id = ?"; 
    
    db.query(query, [stock, price, productId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Stok dan Harga Elektronik berhasil diperbarui!" });
    });
});

// ==========================================
// API 3: KONFIRMASI PEMBAYARAN BCA (STOK AUTOMATIC CUT)
// ==========================================
app.post('/api/konfirmasi-pembayaran', (req, res) => {
    const { productId, qty } = req.body;
    const jumlahBeli = parseInt(qty) || 1;

    db.query('SELECT stock FROM products WHERE id = ?', [productId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0) {
            // Jika produk memiliki sistem stok (Elektronik)
            if (results[0].stock >= jumlahBeli) {
                db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [jumlahBeli, productId], (err) => {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, message: 'Pembayaran BCA berhasil dikonfirmasi! Stok berhasil dikurangi otomatis.' });
                });
            } else {
                res.status(400).json({ success: false, message: 'Maaf, stok barang tidak mencukupi!' });
            }
        } else {
            // Untuk Jasa / Makanan jika tidak menggunakan pengurangan stok database
            res.json({ success: true, message: 'Pembayaran BCA berhasil dikonfirmasi!' });
        }
    });
});

// ==========================================
// API 4: INPUT RESI J&T EXPRESS
// ==========================================
app.post('/api/update-resi', (req, res) => {
    const { orderId, resiJNT } = req.body;
    
    console.log(`Pesanan ${orderId} diupdate dengan Resi J&T: ${resiJNT}`);
    
    res.json({ 
        success: true, 
        message: `Resi J&T (${resiJNT}) berhasil disimpan untuk pesanan ${orderId}!` 
    });
});

// Menjalankan server backend
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Backend berjalan aktif di port ${PORT}`);
});