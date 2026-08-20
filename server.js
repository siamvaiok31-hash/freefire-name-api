const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Free Fire BD Name API Engine is Running! 🚀');
});

app.get('/api/check-ff', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.json({ success: false, message: 'UID is required' });
    }

    let playerName = null;

    // মেথড ১: Garena BD/SG Session-Based Official Handshake
    try {
        const sessionReq = await axios.get('https://shop.garena.sg/api/auth/session', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });

        const cookies = sessionReq.headers['set-cookie'] || [];
        const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');

        const loginReq = await axios.post(
            'https://shop.garena.sg/api/auth/player_id_login',
            {
                app_id: 100067,
                login_id: uid.toString()
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieStr,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Origin': 'https://shop.garena.sg',
                    'Referer': 'https://shop.garena.sg/app/100067/idlogin'
                },
                timeout: 6000
            }
        );

        if (loginReq.data && loginReq.data.nickname) {
            playerName = loginReq.data.nickname;
        }
    } catch (e) {}

    // মেথড ২: UniPin Bangladesh Endpoint
    if (!playerName) {
        try {
            const uniRes = await axios.post(
                'https://api-check.unipin.com/v1/inquiry',
                {
                    game_code: 'ff',
                    user_id: uid.toString()
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                }
            );

            if (uniRes.data && uniRes.data.data && uniRes.data.data.username) {
                playerName = uniRes.data.data.username;
            }
        } catch (e) {}
    }

    // মেথড ৩: Fast Topup Gateway
    if (!playerName) {
        try {
            const fbRes = await axios.get(`https://ff-name-api.vercel.app/api/bd?uid=${encodeURIComponent(uid)}`, { timeout: 5000 });
            if (fbRes.data && (fbRes.data.nickname || fbRes.data.name)) {
                playerName = fbRes.data.nickname || fbRes.data.name;
            }
        } catch (e) {}
    }

    // রেসপন্স প্রদান
    if (playerName) {
        return res.json({
            success: true,
            uid: uid,
            name: playerName
        });
    } else {
        return res.json({
            success: false,
            message: 'Player ID Not Found'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
