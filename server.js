const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Free Fire BD Checker Live! 🚀');
});

app.get('/api/check-ff', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.json({ success: false, message: 'UID is required' });
    }

    let playerName = null;

    // মেথড ১: Garena Direct Gateway Bypass
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api-zoneid.vercel.app/api/freefire',
            data: { id: uid.toString() },
            headers: { 'Content-Type': 'application/json' },
            timeout: 7000
        });

        if (response.data && (response.data.name || response.data.nickname || response.data.username)) {
            playerName = response.data.name || response.data.nickname || response.data.username;
        }
    } catch (err) {}

    // মেথড ২: Dunia Games Direct Scraper
    if (!playerName) {
        try {
            const dgResponse = await axios.post(
                'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
                new URLSearchParams({
                    'productId': '3',
                    'itemId': '353',
                    'catalogId': '376',
                    'paymentId': '752',
                    'gameId': uid.toString()
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    },
                    timeout: 7000
                }
            );

            if (dgResponse.data && dgResponse.data.data && dgResponse.data.data.userName) {
                playerName = dgResponse.data.data.userName;
            }
        } catch (err) {}
    }

    // মেথড ৩: Codashop Direct Handshake
    if (!playerName) {
        try {
            const codaRes = await axios.post(
                'https://order-sg.codashop.com/initPayment.action',
                new URLSearchParams({
                    'voucherPricePoint.id': '8050',
                    'voucherPricePoint.price': '100.0',
                    'voucherPricePoint.variablePrice': '0',
                    'user.userId': uid.toString(),
                    'voucherTypeName': 'FREEFIRE',
                    'shopLang': 'en_GB'
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 7000
                }
            );

            if (codaRes.data && codaRes.data.confirmationFields && codaRes.data.confirmationFields.username) {
                playerName = codaRes.data.confirmationFields.username;
            }
        } catch (err) {}
    }

    // রেজাল্ট রিটার্ন
    if (playerName) {
        return res.json({
            success: true,
            uid: uid,
            name: playerName
        });
    } else {
        return res.json({
            success: false,
            message: 'Player ID invalid or Not Found'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
