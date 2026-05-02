import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://127.0.0.1:5000/api/v1/auth/login', {
            email: "test_new123@example.com",
            password: "password123",
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

testLogin();
