// chatgpt assisted
const http = require("http");
const MESSAGES = require("./lang/en/messages");
const Database = require("./db");

const API_PREFIX = "/lab5/api/v1";
const SQL_ROUTE = `${API_PREFIX}/sql/`;

class Server {
    constructor(port) {
        this.port = port;
        this.database = database;

    }

    start() {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        server.listen(this.port, () => {
            console.log(`${MESSAGES.SERVER_RUNNING} ${this.port}`);
        });
    }

    async handleRequest(req, res) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);

        try {
            if (req.method === "GET" && url.pathname === `${API_PREFIX}/health`) {
                this.sendJson(res, 200, { message: MESSAGES.HEALTH_OK });
                return;
            }

            if (req.method === "POST" && url.pathname === `${API_PREFIX}/insert`) {
                const rowsInserted = await this.database.insertSamplePatients();
                this.sendJson(res, 200, { message: MESSAGES.INSERT_SUCCESS, rowsInserted });
                return;
            }

            if (req.method === "GET" && url.pathname.startsWith(SQL_ROUTE)) {
                await this.handleSqlQuery(url.pathname, res);
                return;
            }

            this.sendJson(res, 404, { error: MESSAGES.NOT_FOUND });
        } catch (err) {
            console.error(err);
            this.sendJson(res, 500, { error: `${MESSAGES.DB_ERROR}: ${err.message}` });
        }
    }

    async handleSqlQuery(pathname, res) {
        try {
            const encoded = pathname.slice(SQL_ROUTE.length);
            const query = this.cleanQuery(decodeURIComponent(encoded));

            if (query === "") {
                this.sendJson(res, 400, { error: MESSAGES.EMPTY_QUERY });
                return;
            }

            const rows = await this.database.runReadQuery(query);
            this.sendJson(res, 200, { rows });
        } catch (err) {
            this.sendJson(res, 400, { error: `${MESSAGES.QUERY_FAILED}: ${err.message}` });
        }
    }

    cleanQuery(text) {
        const trimmed = text.trim();
        const isQuoted = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"');
        return isQuoted ? trimmed.slice(1, -1).trim() : trimmed;
    }

    setCorsHeaders(res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    sendJson(res, status, data) {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    }
}

const PORT = process.env.PORT || 3000;
const database = new Database(
    process.env.WRITER_DATABASE_URL,
    process.env.READER_DATABASE_URL,
    process.env.DB_SSL === "true"
);
new Server(PORT, database).start();
