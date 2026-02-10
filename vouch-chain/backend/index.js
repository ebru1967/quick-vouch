const express = require('express');
const cors = require('cors');
const { Horizon } = require('stellar-sdk');

const app = express();
app.use(cors());

// Stellar Testnet Server bağlantısı
const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// API: Belirli bir adrese gelen "VOUCH" memo'lu işlemleri sayar
app.get('/api/vouches/:address', async (req, res) => {
    const { address } = req.params;
    console.log(`Sorgu geldi: ${address}`); // Konsolda görelim

    try {
        // Son 200 işlemi çek
        const transactions = await server
            .transactions()
            .forAccount(address)
            .limit(200) 
            .order('desc')
            .call();

        // Filtreleme Mantığı: Memo Tipi TEXT ve İçeriği "VOUCH" olanlar
        const vouchTxs = transactions.records.filter(tx => 
            tx.memo_type === 'text' && tx.memo === 'VOUCH'
        );

        res.json({
            address: address,
            vouchCount: vouchTxs.length,
            recentVouches: vouchTxs.map(tx => ({
                hash: tx.hash,
                created_at: tx.created_at,
                source: tx.source_account
            }))
        });

    } catch (error) {
        // Hata detayı
        console.error("Stellar Hatası:", error.message);
        res.status(500).json({ error: 'Veri çekilemedi veya hesap henüz aktif değil.' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Vouch-Chain Backend çalışıyor: http://localhost:${PORT}`);
});