// chatgpt assisted
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const MESSAGES = require("./lang/en/messages");

class SiteFiles {
    async send(url, response) {
        const files = {
            "/client.js": "client.js",
            "/lang/en/messages.js": "lang/en/messages.js"
        };
        const file = files[url] || "index.html";
        const content = await fs.readFile(path.join(__dirname, file));
        response.writeHead(200, {
            "Content-Type": file.endsWith(".js") ? "text/javascript" : "text/html"
        });
        response.end(content);
    }
}

class Server {
    constructor(port) {
        this.port = port;
        this.files = new SiteFiles();
    }

    start() {
        http.createServer((req, res) => {
            this.files.send(req.url, res).catch((error) => {
                res.writeHead(500);
                res.end(error.message);
            });
        }).listen(this.port, () => console.log(`${MESSAGES.SERVER_RUNNING}${this.port}`));
    }
}

new Server(process.env.PORT || 3001).start();
