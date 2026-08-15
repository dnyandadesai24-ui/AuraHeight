async function testBooking() {
    try {
        const flatsRes = await fetch('http://localhost:3000/flats');
        const flats = await flatsRes.json();
        const availableFlat = flats.find(f => f.Status === 'Available');
        
        // Fetch users using a direct db query in node for this test? 
        // No, fetch from /admin/users if it exists, or just do it with db query here.
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testBooking();
