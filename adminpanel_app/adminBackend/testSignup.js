import axios from 'axios';

async function testSignup() {
    try {
        const response = await axios.post('http://127.0.0.1:5000/api/v1/auth/sign-up', {
            email: "test_new123@example.com",
            password: "password123",
            password_confirm: "password123",
            phone: "1234567890"
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

testSignup();
