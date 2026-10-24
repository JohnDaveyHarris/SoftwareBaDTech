const { Pool } = require('pg');
const { createClient } = require('redis');

function createVisitsRouter(pgConfig, redisUrl) {
    const express = require('express');
    const router = express.Router();
    const pool = new Pool(pgConfig);
    const redisClient = createClient({ url: redisUrl });

    router.get('/visits', async (req, res) => {
        await redisClient.connect().catch(() => {});
        const cached = await redisClient.get('visits_count');
        if (cached) {
            return res.json({ count: parseInt(cached, 10), source: 'cache' });
        }

        const result = await pool.query(
            'INSERT INTO visits (created_at) VALUES (NOW()) RETURNING id'
        );
        const countResult = await pool.query('SELECT COUNT(*) FROM visits');
        const count = parseInt(countResult.rows[0].count, 10);

        await redisClient.set('visits_count', count, { EX: 10 });
        res.json({ count, source: 'db', lastId: result.rows[0].id });
    });

    router.close = async () => {
        if (redisClient.isOpen) await redisClient.quit();
        await pool.end();
    };

    return router;
}

module.exports = createVisitsRouter;