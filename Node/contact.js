const express = require("express");
const cors = require("cors");

const app = express();


// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// Contact API
// ===============================

app.post("/contact", async (req, res) => {

    try {

        const {
            Name,
            Email,
            Subject,
            Message
        } = req.body;


        // Validation
        if (!Name || !Email || !Message) {

            return res.status(400).json({
                message: "Name, Email and Message are required"
            });

        }


        // Contact message received
        console.log("Contact Message:");
        console.log("Name:", Name);
        console.log("Email:", Email);
        console.log("Subject:", Subject);
        console.log("Message:", Message);


        res.status(200).json({

            message: "Contact message sent successfully"

        });


    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});


// ===============================
// Server Start
// ===============================

app.listen(3002, () => {

    console.log("Contact server started successfully on port 3002");

});