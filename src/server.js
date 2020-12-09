const app = require('./app');

const { PORT, DB_URL } = require('./config');

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: DB_URL
});

app.listen(PORT, () => {
  console.log(`Server listeting at http://localhost:${PORT}`);
});
