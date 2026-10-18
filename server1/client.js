class PatientClient {
    constructor() {
        this.api = document.body.dataset.api;
    }

    async insert() {
        const response = await fetch(`${this.api}/insert`, { method: "POST" });
        return response.json();
    }

    async query(sql) {
        const response = await fetch(`${this.api}/sql/${encodeURIComponent(sql)}`);
        return response.json();
    }
}

class PatientPage {
    constructor() {
        this.client = new PatientClient();
        this.sql = document.getElementById("sql");
        this.output = document.getElementById("response");
    }

    async display(request) {
        try {
            this.output.textContent = JSON.stringify(await request, null, 2);
        } catch (error) {
            this.output.textContent = error.message;
        }
    }

    start() {
        document.title = MESSAGES.PAGE_TITLE;
        this.sql.value = MESSAGES.SQL_PLACEHOLDER;
        document.querySelectorAll("[data-message]").forEach((element) => {
            element.textContent = MESSAGES[element.dataset.message];
        });
        document.getElementById("insert").addEventListener("click", () => {
            this.display(this.client.insert());
        });
        document.getElementById("query-form").addEventListener("submit", (event) => {
            event.preventDefault();
            this.display(this.client.query(this.sql.value));
        });
    }
}

new PatientPage().start();
