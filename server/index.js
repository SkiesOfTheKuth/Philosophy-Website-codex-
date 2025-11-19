require('dotenv').config();
const app = require('./app');
const config = require('./config');

const port = config.port;

app.listen(port, () => {
    console.log(`Aurora Analytics server listening on port ${port} (${config.env})`);
});
