const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function setupMainAdmin() {
    const dbConfig = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "studily"
    };

    try {
        // Create database connection
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database successfully");

        // Create main_admins table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS main_admins (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                status VARCHAR(10) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("Main admins table created/verified");

        // Hash the password
        const password = "Tessa1234";
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");

        // Insert the main admin account
        const [result] = await connection.execute(`
            INSERT INTO main_admins (email, password, name, status) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                password = VALUES(password),
                name = VALUES(name),
                status = VALUES(status)
        `, ["wmillema1@gmail.com", hashedPassword, "Main Administrator", "active"]);

        if (result.affectedRows > 0) {
            console.log("Main admin account created/updated successfully");
        } else {
            console.log("Main admin account already exists");
        }

        // Verify the account was created
        const [admins] = await connection.execute(
            "SELECT id, email, name, status, created_at FROM main_admins WHERE email = ?",
            ["wmillema1@gmail.com"]
        );

        if (admins.length > 0) {
            console.log("\n✅ Main Admin Account Details:");
            console.log("Email:", admins[0].email);
            console.log("Name:", admins[0].name);
            console.log("Status:", admins[0].status);
            console.log("Created:", admins[0].created_at);
            console.log("\n🎉 Main admin account setup completed successfully!");
        } else {
            console.log("❌ Failed to create main admin account");
        }

        await connection.end();
        console.log("Database connection closed");

    } catch (error) {
        console.error("❌ Error setting up main admin:", error);
        process.exit(1);
    }
}

// Run the setup
setupMainAdmin(); 