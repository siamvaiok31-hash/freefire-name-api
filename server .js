const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Free Fire BD Real Name API Live! 🚀');
});

// ১০০% রিয়েল বিডি সার্ভার হ্যান্ডশেক চেকার
app.get('/api/check-ff', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.json({ success: false, message: 'UID is required' });
    }

    try {
        // ১. Garena BD/SG সার্ভার থেকে সিক্রেট সেশন ও টোকেন সংগ্রহ
        const initSession = await axios.get('https://shop.garena.sg/api/auth/session', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://shop.garena.sg/app/100067/idlogin'
            },
            timeout: 8000
        });

        // কুকি ফিল্টার করা
        const setCookieHeaders = initSession.headers['set-cookie'] || [];
        const cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');

        // ২. সংগৃহীত সিক্রেট কুকি দিয়ে গ্যারেনা বিডি প্লেয়ার আইডিতে রিকোয়েস্ট পাঠানো
        const garenaResponse = await axios.post(
            'https://shop.garena.sg/api/auth/player_id_login',
            {
                app_id: 100067,
                login_id: uid.toString(),
                app_server_id: 0
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Origin': 'https://shop.garena.sg',
                    'Referer': 'https://shop.garena.sg/app/100067/idlogin',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Dest': 'empty'
                },
                timeout: 8000
            }
        );

        const data = garenaResponse.data;

        // নাম পাওয়া গেলে রিটার্ন করবে
        if (data && data.nickname) {
            return res.json({
                success: true,
                uid: uid,
                name: data.nickname,
                region: data.region || 'BD'
            });
        } 
        
        // ৩. ব্যাকআপ: যদি Garena SG বিজি থাকে, তবে UniPin Global Proxy ট্রাই করবে
        const uniResponse = await axios.post('https://www.unipin.com/api/transaction/order-request/in-game-checkout', {
            app_id: "freefire",
            user_id: uid.toString(),
            zone_id: ""
        }, { timeout: 6000 }).catch(() => null);

        if (uniResponse && uniResponse.data && uniResponse.data.data && uniResponse.data.data.user_name) {
            return res.json({
                success: true,
                uid: uid,
                name: uniResponse.data.data.user_name
            });
        }

        return res.json({
            success: false,
            message: 'Player ID Not Found'
        });

    } catch (err) {
        return res.json({
            success: false,
            message: 'Garena Server Busy. Please try again.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
