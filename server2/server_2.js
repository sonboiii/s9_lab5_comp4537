const http = require('node:http');
const { Pool, types } = require('pg');
const MESSAGES = require('./lang/en/messages');

const API_PREFIX = '/lab5/api/v1';
const SQL_ROUTE = `${API_PREFIX}/sql/`;
const USE_LOCAL_DB = !process.argv.includes('--remote');

types.setTypeParser(1114, (value) => value);

class PatientDatabase {
  constructor() {
    const writerUrl = USE_LOCAL_DB ? process.env.LOCAL_WRITER_DATABASE_URL : process.env.WRITER_DATABASE_URL;
    const readerUrl = USE_LOCAL_DB ? process.env.LOCAL_READER_DATABASE_URL : process.env.READER_DATABASE_URL;
    if (!writerUrl || !readerUrl) {
      throw new Error(`Missing database connection strings for ${USE_LOCAL_DB ? 'local' : 'hosted'} mode`);
    }
    const ssl = !USE_LOCAL_DB && process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
    this.writer = new Pool({
      connectionString: writerUrl,
      ssl
    });
    this.reader = new Pool({
      connectionString: readerUrl,
      ssl
    });
  }

  async insert() {
    await this.writer.query(`
      CREATE TABLE IF NOT EXISTS patient (
        patientid SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        dateofbirth TIMESTAMP NOT NULL
      )
    `);
    return this.writer.query(`
      INSERT INTO patient (name, dateofbirth) VALUES
        ('Sara Brown', '1901-01-01'),
        ('John Smith', '1941-01-01'),
        ('Jack Ma', '1961-01-30'),
        ('Elon Musk', '1999-01-01')
      RETURNING *
    `);
  }

  read(sql) {
    return this.reader.query(sql);
  }
}

class ApiServer {
  constructor(port = process.env.PORT || 3000, database = new PatientDatabase()) {
    this.port = port;
    this.database = database;
  }

  async handle(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url, 'http://localhost');

      if (request.method === 'GET' && url.pathname === `${API_PREFIX}/health`) {
        this.sendJson(response, 200, { message: MESSAGES.HEALTH_OK });
      } else if (request.method === 'POST' && url.pathname === `${API_PREFIX}/insert`) {
        const result = await this.database.insert();
        this.sendJson(response, 200, { message: MESSAGES.INSERT_SUCCESS, rowsInserted: result.rowCount });
      } else if (request.method === 'GET' && url.pathname.startsWith(SQL_ROUTE)) {
        await this.handleSqlQuery(url.pathname, response);
      } else {
        this.sendJson(response, 404, { error: MESSAGES.NOT_FOUND });
      }
    } catch (error) {
      this.sendJson(response, 500, { error: `${MESSAGES.DB_ERROR}: ${error.message}` });
    }
  }

  async handleSqlQuery(pathname, response) {
    try {
      let sql = decodeURIComponent(pathname.slice(SQL_ROUTE.length)).trim();
      if (sql.length >= 2 && sql.startsWith('"') && sql.endsWith('"')) {
        sql = sql.slice(1, -1).trim();
      }
      if (!sql) {
        this.sendJson(response, 400, { error: MESSAGES.EMPTY_QUERY });
        return;
      }

      const result = await this.database.read(sql);
      const lastResult = Array.isArray(result) ? result[result.length - 1] : result;
      this.sendJson(response, 200, { rows: lastResult.rows });
    } catch (error) {
      this.sendJson(response, 400, { error: `${MESSAGES.QUERY_FAILED}: ${error.message}` });
    }
  }

  sendJson(response, status, data) {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
  }

  start() {
    return http.createServer((request, response) => this.handle(request, response))
      .listen(this.port, () => console.log(`${MESSAGES.SERVER_RUNNING} ${this.port}`));
  }
}

if (require.main === module) {
  new ApiServer().start();
}

module.exports = ApiServer;
