const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Free Fire BD Name API is Live & Running! 🚀');
});

// মেইন নেম চেকার API রুট
app.get('/api/check-ff', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.json({ success: false, message: 'UID is required' });
    }

    let playerName = null;

    // মেথড ১: UniPin Official Gateway (Render-এ ১০০% স্পিডে কাজ করে)
    try {
        const uniRes = await axios.post(
            'https://www.unipin.com/api/transaction/order-request/in-game-checkout',
            {
                app_id: 'freefire',
                user_id: uid.toString(),
                zone_id: ''
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                },
                timeout: 6000
            }
        );

        if (uniRes.data && uniRes.data.data && (uniRes.data.data.user_name || uniRes.data.data.role_name)) {
            playerName = uniRes.data.data.user_name || uniRes.data.data.role_name;
        }
    } catch (e) {}

    // মেথড ২: Garena Direct Gateway (যদি ১ নম্বর মিস হয়)
    if (!playerName) {
        try {
            const garenaRes = await axios.post(
                'https://shop.garena.my/api/auth/player_id_login',
                {
                    app_id: 100067,
                    login_id: uid.toString()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                        'Origin': 'https://shop.garena.my',
                        'Referer': 'https://shop.garena.my/app/100067/idlogin'
                    },
                    timeout: 6000
                }
            );

            if (garenaRes.data && garenaRes.data.nickname) {
                playerName = garenaRes.data.nickname;
            }
        } catch (e) {}
    }

    // মেথড ৩: Fast Backup Scraper
    if (!playerName) {
        try {
            const pubRes = await axios.get(`https://api.vkrdown.com/freefire/?id=${encodeURIComponent(uid)}`, { timeout: 5000 });
            if (pubRes.data && (pubRes.data.name || pubRes.data.nickname)) {
                playerName = pubRes.data.name || pubRes.data.nickname;
            }
        } catch (e) {}
    }

    // ফাইনাল রেসপন্স
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
