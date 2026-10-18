const MESSAGES = {
    SERVER_RUNNING: "Server 1: http://localhost:",
    PAGE_TITLE: "Patients",
    INSERT_PATIENTS: "Insert patients",
    SQL_QUERY: "SQL query",
    SQL_PLACEHOLDER: "SELECT * FROM patient;",
    SUBMIT_QUERY: "Submit query",
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = MESSAGES;
}
