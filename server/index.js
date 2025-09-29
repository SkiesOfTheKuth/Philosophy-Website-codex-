require('dotenv').config();
const createApp = require('./app');
const { loadConfig } = require('./config');

const config = loadConfig();
const app = createApp({ config });

app.listen(config.port, () => {
    console.log(`Aurora Analytics server listening on port ${config.port}`);
});
