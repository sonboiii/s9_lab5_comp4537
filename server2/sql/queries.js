const QUERIES = {
    CREATE_PATIENT_TABLE: `
    CREATE TABLE IF NOT EXISTS patient (
      patientid   SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      dateofbirth TIMESTAMP NOT NULL
    )`,

    INSERT_SAMPLE_PATIENTS: `
    INSERT INTO patient (name, dateofbirth) VALUES
      ('Sara Brown', '1901-01-01'),
      ('John Smith', '1941-01-01'),
      ('Jack Ma',    '1961-01-30'),
      ('Elon Musk',  '1999-01-01')`,
};

module.exports = QUERIES;