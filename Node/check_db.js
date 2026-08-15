const mysql = require('mysql2/promise');

async function check() {
    const db = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "society_management"
    });

    try {
        await db.query("ALTER TABLE Users ADD COLUMN User_Status VARCHAR(50) DEFAULT 'User'");
        console.log("Added User_Status column.");
        
        await db.query("UPDATE Users SET User_Status = 'Resident' WHERE User_ID IN (SELECT User_ID FROM bookings) OR User_ID IN (SELECT User_ID FROM flats WHERE User_ID IS NOT NULL)");
        console.log("Updated existing residents.");
        
        const [users] = await db.query('SELECT User_ID, Full_Name, User_Status FROM Users');
        console.log("Current users:", users);
    } catch(e) {
        console.error("users err:", e.message);
    }
    
    process.exit();
}

check();
