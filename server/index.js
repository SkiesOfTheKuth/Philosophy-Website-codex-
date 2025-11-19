require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Aurora Analytics server listening on port ${port}`);
});
