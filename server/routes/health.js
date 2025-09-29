const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    const config = req.app.get('config');
    res.json({
        status: 'ok',
        service: config.appName,
        version: config.version,
        environment: config.env,
        uptime: process.uptime(),
        startedAt: req.app.get('startedAt'),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
