require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("./mailer");
const OpenAI = require("openai");

const openAiClient = new OpenAI({
  apiKey: process.env.OPENROUTERKEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "My Chatbot",
  },
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
    host: process.env.lhost || "localhost",
    port: process.env.lport || 3306,
    user: process.env.luser || "root",
    password: process.env.lpassword || "",
    database: process.env.ldatabase || "society_management",
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

console.log("Database connected successfully");

// JWT Secret
const JWT_SECRET = "society_admin_secret_2026_secure_key";

// =============================================
// AUTO-CREATE TABLES IF NOT EXIST
// =============================================
async function initDB() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(200),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS Users (
                User_ID INT AUTO_INCREMENT PRIMARY KEY,
                Full_Name VARCHAR(255) NOT NULL,
                Username VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL UNIQUE,
                Mobile VARCHAR(20) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                Role VARCHAR(50) DEFAULT 'Resident',
                Resident_Type VARCHAR(50) DEFAULT 'Owner',
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Drop the unique index on Username if it exists so duplicate usernames are allowed
        try {
            await db.query("ALTER TABLE Users DROP INDEX Username");
        } catch (e) {
            // Ignore error if index doesn't exist
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS flats (
                Flat_ID INT AUTO_INCREMENT PRIMARY KEY,
                Flat_No VARCHAR(50) NOT NULL,
                Wing VARCHAR(50) NOT NULL,
                Flat_Type VARCHAR(50) NOT NULL,
                Floor_No INT NOT NULL,
                Area_Sqft INT NOT NULL,
                Maintenance_Amount DECIMAL(10, 2) NOT NULL,
                Status VARCHAR(50) DEFAULT 'Available',
                User_ID INT DEFAULT NULL,
                Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE SET NULL
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                Booking_ID INT AUTO_INCREMENT PRIMARY KEY,
                User_ID INT NOT NULL,
                Flat_ID INT NOT NULL,
                Payment_Type VARCHAR(50) NOT NULL,
                Booking_Status VARCHAR(50) DEFAULT 'Pending',
                Booking_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
                FOREIGN KEY (Flat_ID) REFERENCES flats(Flat_ID) ON DELETE CASCADE
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(User_ID) ON DELETE CASCADE
            )
        `);

        // Check if default admin exists, if not create one
        const [existing] = await db.query("SELECT * FROM admins WHERE username = ?", ["admin"]);
        if (existing.length === 0) {
            const hashed = await bcrypt.hash("admin@123", 10);
            await db.query(
                "INSERT INTO admins (username, email, password) VALUES (?, ?, ?)",
                ["admin", "admin@societymanagement.com", hashed]
            );
            console.log("Default admin created: admin / admin@123");
        }
    } catch (err) {
        console.error("DB Init error:", err.message);
    }
}

initDB();

// =============================================
// JWT MIDDLEWARE
// =============================================
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// =============================================
// ADMIN AUTH APIs
// =============================================

// Admin Login
app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const [admins] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);

        if (admins.length === 0) {
            return res.status(401).json({ message: "Invalid credentials", flag: 0 });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", flag: 0 });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, email: admin.email },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Admin login successful",
            flag: 1,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify Admin Token
app.get("/admin/verify", verifyAdmin, (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

// =============================================
// ADMIN STATS API
// =============================================
app.get("/admin/stats", verifyAdmin, async (req, res) => {
    try {
        const [[userCount]] = await db.query(`
            SELECT COUNT(*) AS total FROM Users 
        `);
        const [[residentCount]] = await db.query(`
            SELECT COUNT(DISTINCT User_ID) AS total FROM bookings WHERE Booking_Status = 'Confirmed'
        `);
        const [[flatCount]] = await db.query("SELECT COUNT(*) AS total FROM flats");
        const [[bookedCount]] = await db.query("SELECT COUNT(*) AS total FROM flats WHERE Status = 'Booked'");
        const [[availableCount]] = await db.query("SELECT COUNT(*) AS total FROM flats WHERE Status = 'Available'");
        const [[bookingCount]] = await db.query("SELECT COUNT(*) AS total FROM bookings");
        const [[contactCount]] = await db.query("SELECT COUNT(*) AS total FROM contacts");

        // Recent users
        const [recentUsers] = await db.query(`
            SELECT User_ID, Full_Name, Email, Role, Created_At FROM Users 
            WHERE User_ID IN (SELECT User_ID FROM bookings) 
               OR User_ID IN (SELECT User_ID FROM flats WHERE User_ID IS NOT NULL)
            ORDER BY Created_At DESC LIMIT 5
        `);

        // Recent bookings
        const [recentBookings] = await db.query(`
            SELECT b.Booking_ID, b.Booking_Status, b.Booking_Date,
                   f.Flat_No, f.Wing, u.Full_Name
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            JOIN Users u ON b.User_ID = u.User_ID
            ORDER BY b.Booking_Date DESC LIMIT 5
        `);

        // Role distribution
        const [roleStats] = await db.query(`
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed') THEN 'Resident'
                    ELSE 'User'
                END AS Role,
                COUNT(*) AS count
            FROM Users
            GROUP BY 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed') THEN 'Resident'
                    ELSE 'User'
                END
        `);

        res.json({
            users: userCount.total,
            residents: residentCount.total,
            flats: flatCount.total,
            bookedFlats: bookedCount.total,
            availableFlats: availableCount.total,
            bookings: bookingCount.total,
            contacts: contactCount.total,
            recentUsers,
            recentBookings,
            roleStats
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// REGISTER & LOGIN APIs
// =============================================

// Register API
app.post("/register", async (req, res) => {
    try {
        const {
            full_name,
            username,
            email,
            mobile,
            password,
            role = "Resident",
            resident_type = "Owner"
        } = req.body;

        if (!full_name || !username || !email || !mobile || !password) {
            return res.status(400).json({
                message: "Full name, username, email, mobile, and password are required"
            });
        }

        const checkSql = "SELECT * FROM Users WHERE Email = ?";
        const [existingUsers] = await db.query(checkSql, [email]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO Users
            (Full_Name, Username, Email, Mobile, Password, Role, Resident_Type)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [
            full_name, username, email, mobile, hashedPassword, role, resident_type
        ]);

        try {
            // Send Welcome Email to User
            await transporter.sendMail({
                from: '"AuraHeights" <dnyandadesai24@gmail.com>',
                to: email,
                subject: "Welcome to AuraHeights! 🎉",
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
                            <div style="background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%); padding: 32px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Welcome to AuraHeights!</h1>
                            </div>
                            <div style="padding: 40px 32px;">
                                <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">
                                    Hello <strong style="color: #0f172a; font-size: 18px;">${full_name}</strong>,<br><br>
                                    Thank you for joining the <strong>AuraHeights</strong> community! We are thrilled to have you on board.
                                </p>
                                <p style="font-size: 16px; color: #334155; line-height: 1.6;">
                                    You can now log in to your account and explore our premium flats. If you find one you love, you can easily request a booking right from your dashboard.
                                </p>
                                <div style="text-align: center; margin: 36px 0;">
                                    <a href="https://auraheight.pages.dev/login" style="background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Login to your account</a>
                                </div>
                                <p style="font-size: 15px; color: #64748b; margin-bottom: 0;">
                                    If you have any questions, feel free to reply to this email.<br>
                                    - The AuraHeights Team
                                </p>
                            </div>
                            <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 13px; margin: 0;">&copy; ${new Date().getFullYear()} AuraHeights Society Management. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                `
            });

            // Send Alert to Admin
            await transporter.sendMail({
                from: '"AuraHeights System" <dnyandadesai24@gmail.com>',
                to: "dnyandadesai24@gmail.com",
                subject: "New User Registration",
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
                            <div style="background: #0f172a; padding: 24px 20px; text-align: center;">
                                <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">System Alert: New Registration</h2>
                            </div>
                            <div style="padding: 32px;">
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                                    <p style="margin: 0 0 10px 0; color: #334155;"><strong>Full Name:</strong> ${full_name}</p>
                                    <p style="margin: 0 0 10px 0; color: #334155;"><strong>Username:</strong> ${username}</p>
                                    <p style="margin: 0 0 10px 0; color: #334155;"><strong>Email:</strong> ${email}</p>
                                    <p style="margin: 0 0 10px 0; color: #334155;"><strong>Mobile:</strong> ${mobile}</p>
                                    <p style="margin: 0; color: #64748b; font-size: 13px; margin-top: 16px;">Registered at: ${new Date().toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error("Failed to send email:", mailErr.message);
        }

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const userSql = "SELECT User_ID, Full_Name, Username, Email, Mobile, Password, Role, Resident_Type FROM Users WHERE Email = ?";
        const [userData] = await db.query(userSql, [email]);

        if (userData.length === 0) {
            return res.json({ message: "Email not found", flag: 0 });
        }

        const user = userData[0];
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            return res.json({ message: "Incorrect password", flag: 0 });
        }

        return res.json({
            message: "Login successful",
            flag: 1,
            uid: user.User_ID,
            uname: user.Full_Name,
            uusername: user.Username,
            umail: user.Email,
            role: user.Role,
            resident_type: user.Resident_Type
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// USERS CRUD APIs
// =============================================

// Create a user
app.post("/users", async (req, res) => {
    try {
        const {
            full_name, username, email, mobile, password,
            role = "Resident", resident_type = "Owner"
        } = req.body;

        if (!full_name || !username || !email || !mobile || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [existingUsers] = await db.query(
            "SELECT * FROM Users WHERE Email = ?", [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO Users (Full_Name, Username, Email, Mobile, Password, Role, Resident_Type) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        await db.query(sql, [full_name, username, email, mobile, hashedPassword, role, resident_type]);
        res.status(201).json({ message: "User added successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users
app.get("/users", async (req, res) => {
    try {
        const sql = `
            SELECT User_ID AS id, Full_Name AS full_name, Username AS username,
                   Email AS email, Mobile AS mobile, Role AS role,
                   Resident_Type AS resident_type, 
                   CASE 
                       WHEN EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed') THEN 'Resident'
                       ELSE 'User'
                   END AS user_status, 
                   Created_At AS created_at
            FROM Users`;
        const [users] = await db.query(sql);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user by id
app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT User_ID AS id, Full_Name AS full_name, Username AS username,
                   Email AS email, Mobile AS mobile, Role AS role,
                   Resident_Type AS resident_type, Created_At AS created_at
            FROM Users WHERE User_ID = ?`;
        const [user] = await db.query(sql, [id]);

        if (user.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(user[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, username, email, mobile, password, role, resident_type } = req.body;

        if (!full_name || !username || !email || !mobile) {
            return res.status(400).json({ message: "Full name, username, email, and mobile are required" });
        }

        let sql, params;

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = `UPDATE Users SET Full_Name=?, Username=?, Email=?, Mobile=?, Password=?, Role=?, Resident_Type=? WHERE User_ID=?`;
            params = [full_name, username, email, mobile, hashedPassword, role, resident_type, id];
        } else {
            sql = `UPDATE Users SET Full_Name=?, Username=?, Email=?, Mobile=?, Role=?, Resident_Type=? WHERE User_ID=?`;
            params = [full_name, username, email, mobile, role, resident_type, id];
        }

        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User updated successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM Users WHERE User_ID = ?", [id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search users
app.post("/search", async (req, res) => {
    try {
        const { full_name, username, email } = req.body;
        const sql = `
            SELECT User_ID AS id, Full_Name AS full_name, Username AS username,
                   Email AS email, Mobile AS mobile, Role AS role,
                   Resident_Type AS resident_type
            FROM Users
            WHERE (Full_Name LIKE ? OR Username LIKE ? OR Email LIKE ?)
              AND (User_ID IN (SELECT User_ID FROM bookings) 
                   OR User_ID IN (SELECT User_ID FROM flats WHERE User_ID IS NOT NULL))`;

        const [users] = await db.query(sql, [
            `%${full_name || ""}%`, `%${username || ""}%`, `%${email || ""}%`
        ]);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Users pagination
app.get("/epagination", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const statusFilter = req.query.status;

        let countSql = `SELECT COUNT(*) AS total FROM Users`;
        let dataSql = `
            SELECT User_ID AS id, Full_Name AS full_name, Username AS username,
                   Email AS email, Mobile AS mobile, Role AS role,
                   Resident_Type AS resident_type, 
                   CASE 
                       WHEN EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed') THEN 'Resident'
                       ELSE 'User'
                   END AS user_status, 
                   Created_At AS created_at
            FROM Users`;
        
        let queryParams = [];
        
        if (statusFilter === 'Resident') {
            countSql += ` WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed')`;
            dataSql += ` WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed')`;
        } else if (statusFilter === 'User') {
            countSql += ` WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed')`;
            dataSql += ` WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.User_ID = Users.User_ID AND b.Booking_Status = 'Confirmed')`;
        }
        
        dataSql += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [[{ total }]] = await db.query(countSql, statusFilter ? [statusFilter] : []);
        const totalPages = Math.ceil(total / limit);

        const [result] = await db.query(dataSql, queryParams);

        res.json({ data: result, total, page, limit, totalPages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// FLATS APIs
// =============================================

// Get All Flats
app.get("/flats", async (req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM flats");
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Flat
app.get("/flats/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("SELECT * FROM flats WHERE Flat_ID=?", [id]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Flat (Admin)
app.post("/flats", async (req, res) => {
    try {
        const { Flat_No, Wing, Flat_Type, Floor_No, Area_Sqft, Status = "Available", Maintenance_Amount } = req.body;

        if (!Flat_No || !Wing || !Flat_Type || !Floor_No || !Area_Sqft || !Maintenance_Amount) {
            return res.status(400).json({ message: "All flat fields are required" });
        }

        const sql = `INSERT INTO flats (Flat_No, Wing, Flat_Type, Floor_No, Area_Sqft, Status, Maintenance_Amount) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [Flat_No, Wing, Flat_Type, Floor_No, Area_Sqft, Status, Maintenance_Amount]);

        res.status(201).json({ message: "Flat added successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Flat
app.put("/flats/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { User_ID, Flat_No, Wing, Flat_Type, Floor_No, Area_Sqft, Status, Maintenance_Amount } = req.body;

        const sql = `UPDATE flats SET User_ID=?, Flat_No=?, Wing=?, Flat_Type=?, Floor_No=?, Area_Sqft=?, Status=?, Maintenance_Amount=? WHERE Flat_ID=?`;
        await db.query(sql, [User_ID, Flat_No, Wing, Flat_Type, Floor_No, Area_Sqft, Status, Maintenance_Amount, id]);

        res.json({ message: "Flat Updated Successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Flat
app.delete("/flats/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM flats WHERE Flat_ID=?", [id]);
        res.json({ message: "Flat Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// BOOKINGS APIs
// =============================================

// Get All Bookings
app.get("/bookings", async (req, res) => {
    try {
        const sql = `
            SELECT b.Booking_ID, b.User_ID, b.Flat_ID, b.Payment_Type,
                   b.Booking_Status, b.Booking_Date,
                   f.Flat_No, f.Wing, f.Flat_Type, f.Area_Sqft,
                   u.Full_Name, u.Email
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            JOIN Users u ON b.User_ID = u.User_ID
        `;
        const [result] = await db.query(sql);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Booking
app.get("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT b.*, f.Flat_No, f.Wing, f.Flat_Type, f.Area_Sqft, u.Full_Name, u.Email
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            JOIN Users u ON b.User_ID = u.User_ID
            WHERE b.Booking_ID=?
        `;
        const [result] = await db.query(sql, [id]);
        if (result.length === 0) return res.status(404).json({ message: "Booking not found" });
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Book Flat
app.post("/bookings", async (req, res) => {
    try {
        const { User_ID, Flat_ID, Payment_Type } = req.body;

        const [flat] = await db.query("SELECT * FROM flats WHERE Flat_ID=?", [Flat_ID]);
        if (flat.length === 0) return res.status(404).json({ message: "Flat not found" });
        if (flat[0].Status === "Booked") return res.status(400).json({ message: "Flat is already booked" });

        const [user] = await db.query("SELECT Full_Name, Email FROM Users WHERE User_ID=?", [User_ID]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });

        await db.query("INSERT INTO bookings (User_ID, Flat_ID, Payment_Type) VALUES (?, ?, ?)", [User_ID, Flat_ID, Payment_Type]);

        // Update flat status to Pending
        await db.query("UPDATE flats SET Status='Pending' WHERE Flat_ID=?", [Flat_ID]);
        
        // Update User Status to Resident
        await db.query("UPDATE Users SET User_Status='Resident' WHERE User_ID=?", [User_ID]);

        res.status(201).json({ message: "Flat booked successfully and is pending confirmation" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Booking Status
app.put("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { Booking_Status } = req.body;

        const [booking] = await db.query("SELECT Flat_ID, User_ID FROM bookings WHERE Booking_ID=?", [id]);
        if (booking.length === 0) return res.status(404).json({ message: "Booking not found" });

        const [result] = await db.query("UPDATE bookings SET Booking_Status=? WHERE Booking_ID=?", [Booking_Status, id]);

        if (Booking_Status === "Confirmed") {
            await db.query("UPDATE flats SET Status='Booked' WHERE Flat_ID=?", [booking[0].Flat_ID]);

            const [user] = await db.query("SELECT Full_Name, Email FROM Users WHERE User_ID=?", [booking[0].User_ID]);
            const [flat] = await db.query("SELECT * FROM flats WHERE Flat_ID=?", [booking[0].Flat_ID]);

            if (user.length > 0 && flat.length > 0) {
                await transporter.sendMail({
                    from: '"AuraHeights" <dnyandadesai24@gmail.com>',
                    to: user[0].Email,
                    subject: "Flat Booking Confirmed 🎉",
                    html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Booking Confirmed!</h1>
                            </div>
                            <div style="padding: 40px 32px;">
                                <p style="font-size: 16px; color: #334155; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">
                                    Hello <strong style="color: #0f172a; font-size: 18px;">${user[0].Full_Name}</strong>,<br><br>
                                    Great news! Your flat booking has been successfully reviewed and <strong>accepted</strong> by the admin. Welcome to your new home!
                                </p>
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin-bottom: 32px;">
                                    <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px 0; color: #64748b; font-size: 15px; border-top: 1px solid #f1f5f9;">Status</td>
                                            <td style="padding: 10px 0; color: #10b981; font-weight: 800; text-align: right; font-size: 15px; border-top: 1px solid #f1f5f9; text-transform: uppercase;">✅ Booked</td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0; text-align: center;">
                                    Thank you for using the <strong>Society Management System</strong>.<br>If you have any further inquiries, please feel free to contact the administration.
                                </p>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                                    &copy; ${new Date().getFullYear()} Society Management Team.<br>All rights reserved.
                                </p>
                            </div>
                            
                        </div>
                    </div>`
                });
            }
        } else if (Booking_Status === "Cancelled" || Booking_Status === "Rejected") {
            await db.query("UPDATE flats SET Status='Available' WHERE Flat_ID=?", [booking[0].Flat_ID]);
        }

        res.json({ message: "Booking status updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Cancel / Delete Booking
app.delete("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [booking] = await db.query("SELECT Flat_ID FROM bookings WHERE Booking_ID=?", [id]);

        if (booking.length === 0) return res.status(404).json({ message: "Booking not found" });

        const Flat_ID = booking[0].Flat_ID;
        await db.query("DELETE FROM bookings WHERE Booking_ID=?", [id]);
        await db.query("UPDATE flats SET Status='Available' WHERE Flat_ID=?", [Flat_ID]);

        res.json({ message: "Booking cancelled successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// CONTACT APIs
// =============================================

// Submit Contact Message
app.post("/contact", async (req, res) => {
    try {
        const { Name, Email, Subject, Message } = req.body;

        if (!Name || !Email || !Message) {
            return res.status(400).json({ message: "Name, Email and Message are required" });
        }

        await db.query(
            "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
            [Name, Email, Subject || "", Message]
        );

        // Send email notification to Admin
        try {
            await transporter.sendMail({
                from: '"AuraHeights Helpdesk" <dnyandadesai24@gmail.com>',
                to: "dnyandadesai24@gmail.com",
                replyTo: Email,
                subject: `New Contact Message: ${Subject || 'No Subject'}`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px 20px; text-align: center;">
                                <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">New Helpdesk Request</h2>
                            </div>
                            <div style="padding: 32px;">
                                <div style="margin-bottom: 24px;">
                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">From</p>
                                    <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">${Name}</p>
                                    <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 14px;">${Email}</p>
                                </div>
                                <div style="margin-bottom: 24px;">
                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Subject</p>
                                    <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 500;">${Subject || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${Message}</div>
                                </div>
                            </div>
                            <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 12px; margin: 0;">Reply to this email to respond directly to the user.</p>
                            </div>
                        </div>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error("Failed to send contact email:", mailErr.message);
        }

        res.status(200).json({ message: "Contact message sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Contact Messages (Admin)
app.get("/admin/contacts", verifyAdmin, async (req, res) => {
    try {
        const [contacts] = await db.query("SELECT * FROM contacts ORDER BY created_at DESC");
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Contact Message (Admin)
app.delete("/admin/contacts/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM contacts WHERE id=?", [id]);
        res.json({ message: "Contact deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// DASHBOARD APIs
// =============================================



// =============================================
// NOTICES APIs
// =============================================
app.get("/notices", async (req, res) => {
    try {
        const [notices] = await db.query("SELECT * FROM notices ORDER BY created_at DESC");
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/admin/notices", verifyAdmin, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ message: "Title and content required" });
        await db.query("INSERT INTO notices (title, content) VALUES (?, ?)", [title, content]);
        res.status(201).json({ message: "Notice created successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/admin/notices/:id", verifyAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM notices WHERE id=?", [req.params.id]);
        res.json({ message: "Notice deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// COMPLAINTS APIs
// =============================================
app.get("/complaints/:userId", async (req, res) => {
    try {
        const [complaints] = await db.query("SELECT * FROM complaints WHERE user_id=? ORDER BY created_at DESC", [req.params.userId]);
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/complaints", async (req, res) => {
    try {
        const { user_id, subject, description } = req.body;
        if (!user_id || !subject || !description) return res.status(400).json({ message: "All fields required" });
        await db.query("INSERT INTO complaints (user_id, subject, description) VALUES (?, ?, ?)", [user_id, subject, description]);
        res.status(201).json({ message: "Complaint submitted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/admin/complaints", verifyAdmin, async (req, res) => {
    try {
        const [complaints] = await db.query(`
            SELECT c.*, u.Full_Name as user_name, u.Email as user_email
            FROM complaints c JOIN Users u ON c.user_id = u.User_ID
            ORDER BY c.created_at DESC
        `);
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put("/admin/complaints/:id", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query("UPDATE complaints SET status=? WHERE id=?", [status, req.params.id]);
        res.json({ message: "Complaint status updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// MY BOOKINGS API
// =============================================
app.get("/user-bookings/:userId", async (req, res) => {
    try {
        const sql = `
            SELECT b.*, f.Flat_No, f.Wing, f.Flat_Type, f.Area_Sqft, f.Maintenance_Amount
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            WHERE b.User_ID=?
            ORDER BY b.Booking_Date DESC
        `;
        const [bookings] = await db.query(sql, [req.params.userId]);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =============================================
// CHATBOT API
// =============================================
app.post("/chat", async (req, res) => {
  try {
    const { message, mode } = req.body;
    
    let messages = [];
    if (mode === "website") {
      messages.push({
        role: "system",
        content: `You are a helpful assistant for the residential society management website called "AuraHeights". 
You provide information exclusively related to the website, its features, and services. 
Here is the website content you must use to answer questions:
- Tagline: Manage Your Society Smarter & Faster. A powerful, all-in-one platform for modern residential societies. Simplify flat management, resident registration, and community administration.
- Statistics: 500+ Happy Residents, 120+ Managed Flats, 300+ Successful Bookings.
- Core Features:
  1. Flats: Users can browse flats, check if they are Available or Booked, and filter by Wing (A, B, C) or Type (1BHK, 2BHK, 3BHK).
  2. Notices: A dedicated board for important society announcements and circulars.
  3. Complaints: Residents can register and track complaints (Categories: Maintenance, Security, Cleanliness, Others) with statuses (Pending, Resolved).
  4. Bookings: Residents can book society amenities like the Clubhouse, Gym, Swimming Pool, and Party Hall.
  5. Services & Contact: Contact forms to reach society administration directly.
Keep your responses very concise, friendly, and focused on this platform. Do not answer general knowledge questions unrelated to this domain.`
      });
    } else {
      messages.push({
        role: "system",
        content: "You are a general AI assistant that can answer users' questions and provide intelligent responses on any topic."
      });
    }
    
    messages.push({ role: "user", content: message });

    const response = await openAiClient.chat.completions.create({
      model: "poolside/laguna-s-2.1:free",
      messages: messages,
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting to my brain right now. Try again later!" });
  }
});

// =============================================
// START SERVER
// =============================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Admin login: admin / admin@123`);
});