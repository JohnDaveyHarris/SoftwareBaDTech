const { GenericContainer, Wait } = require('testcontainers');
const { Pool } = require('pg');
const createVisitsRouter = require('../../src/routes/visits');
const express = require('express');

async function waitForDatabase(pgConfig, attempts = 30) {
  const pool = new Pool(pgConfig);
  let lastError = null;
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  await pool.end();
  if (lastError) throw lastError;
}

async function setupTestApp() {
  const pgContainer = await new GenericContainer('postgres:16')
    .withEnvironment({ POSTGRES_PASSWORD: 'test', POSTGRES_DB: 'testdb' })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections', 2))
    .start();

  const redisContainer = await new GenericContainer('redis:7')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start();

  const pgConfig = {
    host: pgContainer.getHost(),
    port: pgContainer.getMappedPort(5432),   // ДИНАМИЧЕСКИЙ порт — без него конфликты при параллелизме
    user: 'postgres',
    password: 'test',
    database: 'testdb',
  };
  const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;

  await waitForDatabase(pgConfig);

  const pool = new Pool(pgConfig);
  await pool.query('CREATE TABLE visits (id SERIAL PRIMARY KEY, created_at TIMESTAMP)');
  await pool.end();

  const app = express();
  const router = createVisitsRouter(pgConfig, redisUrl);
  app.use('/', router);

  return { app, router, pgContainer, redisContainer };
}

module.exports = { setupTestApp };