require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // mysql2 needs multipleStatements enabled for a script with several
    // CREATE TABLE statements — the pool doesn't have it on by default,
    // so split on ";" and run each statement separately instead.
    const statements = schema
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

    console.log(`Running ${statements.length} migration statement(s)...`);

    for (const statement of statements) {
        await pool.query(statement);
    }

    console.log('Migration complete — eduportal_students, eduportal_accommodation_bookings, eduportal_fee_records are ready.');
    await pool.end();
}

migrate().catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});