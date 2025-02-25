import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || "3306", 10),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 20,
	queueLimit: 0,
});

export default pool;
