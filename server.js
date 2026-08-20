const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// টেস্ট রুট (সার্ভার চেক করার জন্য)
app.get('/', (req, res) => {
    res.send('Free Fire BD Name API is Running Successfully! 🚀');
});

// মেইন নেম চেকার API রুট
app.get('/api/check-ff', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.json({ success: false, message: 'UID is required' });
    }

    try {
        // Garena SG/BD Official Gateway
        const response = await axios.post(
            'https://shop.garena.sg/api/auth/player_id_login',
            {
                app_id: 100067,
                login_id: uid.toString()
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Origin': 'https://shop.garena.sg',
                    'Referer': 'https://shop.garena.sg/app/100067/idlogin',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 8000
            }
        );

        if (response.data && response.data.nickname) {
            return res.json({
                success: true,
                uid: uid,
                name: response.data.nickname,
                region: response.data.region || 'BD'
            });
        } else {
            return res.json({ 
                success: false, 
                message: 'Player ID invalid or Not Found' 
            });
        }
    } catch (err) {
        return res.json({ 
            success: false, 
            message: 'Failed to fetch from Garena server' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
