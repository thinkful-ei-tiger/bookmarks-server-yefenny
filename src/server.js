const app = require('./app');

const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`Server listeting at http://localhost:${PORT}`);
});
