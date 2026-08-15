const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const transporter = require("./mailer");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "society_management"
}).promise();

console.log("Database connected successfully");

// ===============================
// Get All Flats
// ===============================
app.get("/flats", async (req, res) => {
    try {

        const sql = "SELECT * FROM flats";

        const [result] = await db.query(sql);

        res.json(result);
    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
});


// ===============================
// Get Single Flat
// ===============================
app.get("/flats/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const sql = "SELECT * FROM flats WHERE Flat_ID=?";

        const [result] = await db.query(sql, [id]);

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Update Flat
// ===============================
app.put("/flats/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {

            User_ID,
            Flat_No,
            Wing,
            Flat_Type,
            Floor_No,
            Area_Sqft,
            Status,
            Maintenance_Amount

        } = req.body;

        const sql = `
        UPDATE flats
        SET
        User_ID=?,
        Flat_No=?,
        Wing=?,
        Flat_Type=?,
        Floor_No=?,
        Area_Sqft=?,
        Status=?,
        Maintenance_Amount=?
        WHERE Flat_ID=?
        `;

        await db.query(sql, [

            User_ID,
            Flat_No,
            Wing,
            Flat_Type,
            Floor_No,
            Area_Sqft,
            Status,
            Maintenance_Amount,
            id

        ]);

        res.json({

            message: "Flat Updated Successfully"

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Delete Flat
// ===============================
app.delete("/flats/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const sql = "DELETE FROM flats WHERE Flat_ID=?";

        await db.query(sql, [id]);

        res.json({

            message: "Flat Deleted Successfully"

        });

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

// ===============================
// Book Flat
// ===============================
app.post("/bookings", async (req, res) => {

    try {

        const {
            User_ID,
            Flat_ID,
            Payment_Type
        } = req.body;

        // Check flat
        const [flat] = await db.query(
            "SELECT * FROM flats WHERE Flat_ID=?",
            [Flat_ID]
        );

        if (flat.length === 0) {
            return res.status(404).json({
                message: "Flat not found"
            });
        }

        // Check flat status
        if (flat[0].Status === "Booked") {
            return res.status(400).json({
                message: "Flat is already booked"
            });
        }

        // Insert booking
        const sql = `
            INSERT INTO bookings
            (User_ID, Flat_ID, Payment_Type)
            VALUES (?, ?, ?)
        `;

        await db.query(sql, [
            User_ID,
            Flat_ID,
            Payment_Type
        ]);

        // Update flat status to Pending
        await db.query(
            "UPDATE flats SET Status='Pending' WHERE Flat_ID=?",
            [Flat_ID]
        );

        res.status(201).json({
            message: "Flat booked successfully and is pending confirmation"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Get All Bookings
// ===============================
app.get("/bookings", async (req, res) => {

    try {

        const sql = `
            SELECT 
                b.Booking_ID,
                b.User_ID,
                b.Flat_ID,
                b.Payment_Type,
                b.Booking_Status,
                b.Booking_Date,
                f.Flat_No,
                f.Wing,
                f.Flat_Type,
                f.Area_Sqft,
                u.Full_Name as Name,
                u.Email
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            JOIN users u ON b.User_ID = u.User_ID
        `;

        const [result] = await db.query(sql);

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Get Single Booking
// ===============================
app.get("/bookings/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const sql = `
            SELECT 
                b.*,
                f.Flat_No,
                f.Wing,
                f.Flat_Type,
                f.Area_Sqft,
                u.Full_Name as Name,
                u.Email
            FROM bookings b
            JOIN flats f ON b.Flat_ID = f.Flat_ID
            JOIN users u ON b.User_ID = u.User_ID
            WHERE b.Booking_ID=?
        `;

        const [result] = await db.query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json(result[0]);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Update Booking Status
// ===============================
app.put("/bookings/:id", async (req, res) => {

    try {

        const { id } = req.params;
        const { Booking_Status } = req.body;

        const sql = `
            UPDATE bookings
            SET Booking_Status=?
            WHERE Booking_ID=?
        `;

        const [booking] = await db.query("SELECT Flat_ID, User_ID FROM bookings WHERE Booking_ID=?", [id]);
        if (booking.length === 0) return res.status(404).json({ message: "Booking not found" });

        const [result] = await db.query(sql, [
            Booking_Status,
            id
        ]);

        if (Booking_Status === "Confirmed") {
            await db.query("UPDATE flats SET Status='Booked', User_ID=? WHERE Flat_ID=?", [booking[0].User_ID, booking[0].Flat_ID]);
            
            const [user] = await db.query("SELECT Full_Name as Name, Email FROM users WHERE User_ID=?", [booking[0].User_ID]);
            const [flat] = await db.query("SELECT * FROM flats WHERE Flat_ID=?", [booking[0].Flat_ID]);
            
            if (user.length > 0 && flat.length > 0) {
                await transporter.sendMail({
                    from: "dnyandadesai24@gmail.com",
                    to: user[0].Email,
                    subject: "Flat Booking Confirmed",
                    text: `Hello ${user[0].Name},

Flat Booking Confirmed. Your booking has been accepted by the admin.

Flat Details:
-------------------------
Flat No: ${flat[0].Flat_No}
Wing: ${flat[0].Wing}
Flat Type: ${flat[0].Flat_Type}
Floor No: ${flat[0].Floor_No}
Area: ${flat[0].Area_Sqft} Sq.ft
Booking Status: Booked
-------------------------

Thank you for using Society Management System.

Regards,
Society Management Team`
                });
            }
        } else if (Booking_Status === "Cancelled" || Booking_Status === "Rejected") {
            await db.query("UPDATE flats SET Status='Available', User_ID=NULL WHERE Flat_ID=?", [booking[0].Flat_ID]);
        }

        res.json({
            message: "Booking status updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});


// ===============================
// Cancel / Delete Booking
// ===============================
app.delete("/bookings/:id", async (req, res) => {

    try {

        const { id } = req.params;

        // First find Flat_ID
        const [booking] = await db.query(
            "SELECT Flat_ID FROM bookings WHERE Booking_ID=?",
            [id]
        );

        if (booking.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const Flat_ID = booking[0].Flat_ID;

        // Delete booking
        await db.query(
            "DELETE FROM bookings WHERE Booking_ID=?",
            [id]
        );

        // Make flat available again
        await db.query(
            "UPDATE flats SET Status='Available' WHERE Flat_ID=?",
            [Flat_ID]
        );

        res.json({
            message: "Booking cancelled successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

app.listen(3000, () => {
    console.log("Server started successfully on port 3000");
});