const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { init: initSocket } = require('./src/services/socket.service');
const startCronJobs = require('./src/services/cron.service');
const { PORT } = require('./src/config/env');

const server = http.createServer(app);

initSocket(server);
startCronJobs();

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});