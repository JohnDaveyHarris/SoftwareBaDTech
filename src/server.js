const app = require('./app');
const createVisitsRouter = require('./routes/visits');

if (process.env.PGHOST) {
    app.use('/', createVisitsRouter({
        host: process.env.PGHOST,
        port: parseInt(process.env.PORT || '5432', 10),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
    }, process.env.REDIS_URL));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));