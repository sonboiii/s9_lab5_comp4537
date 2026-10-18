const { Pool, types } = require("pg");
const QUERIES = require("./sql/queries");
types.setTypeParser(1114, (value) => value);

class Database {
    constructor(writerUrl, readerUrl, useSsl) {
        const ssl = useSsl ? { rejectUnauthorized: false } : false;
        this.writerPool = new Pool({ connectionString: writerUrl, ssl });
        this.readerPool = new Pool({ connectionString: readerUrl, ssl });
    }

    async ensurePatientTable() {
        await this.writerPool.query(QUERIES.CREATE_PATIENT_TABLE);
    }

    async insertSamplePatients() {
        await this.ensurePatientTable();
        const result = await this.writerPool.query(QUERIES.INSERT_SAMPLE_PATIENTS);
        return result.rowCount;
    }

    async runReadQuery(sql) {
        const result = await this.readerPool.query(sql);
        const lastResult = Array.isArray(result) ? result[result.length - 1] : result;
        return lastResult.rows;
    }
}

module.exports = Database;