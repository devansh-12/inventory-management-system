import pool from '../db';

const API_URL = 'http://localhost:5000/api/auth';
const EMAIL = `test${Date.now()}@example.com`;
const PASSWORD = 'password123';
const NEW_PASSWORD = 'newpassword456';

const post = async (url: string, body: any) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || response.statusText);
    }
    return data;
};

const runTest = async () => {
    try {
        // 1. Register
        console.log(`1. Registering user ${EMAIL}...`);
        try {
            await post(`${API_URL}/register`, {
                email: EMAIL,
                password: PASSWORD,
                name: 'Test User'
            });
        } catch (e: any) {
            console.log('User might already exist:', e.message);
        }
        console.log('Registered.');

        // 2. Forgot Password
        console.log('2. Requesting OTP...');
        await post(`${API_URL}/forgot-password`, { email: EMAIL });
        console.log('OTP requested.');

        // 3. Get OTP from DB
        console.log('3. Retrieving OTP from DB...');
        const res = await pool.query("SELECT token FROM password_reset_tokens WHERE email = $1 ORDER BY created_at DESC LIMIT 1", [EMAIL]);
        const otp = res.rows[0]?.token;

        if (!otp) {
            throw new Error("OTP not found in DB");
        }
        console.log(`OTP retrieved: ${otp}`);

        // 4. Reset Password
        console.log('4. Reseting password...');
        await post(`${API_URL}/reset-password`, {
            email: EMAIL,
            otp: otp,
            newPassword: NEW_PASSWORD
        });
        console.log('Password reset successful.');

        // 5. Login with OLD password (should fail)
        console.log('5. Attempting login with OLD password...');
        try {
            await post(`${API_URL}/login`, {
                email: EMAIL,
                password: PASSWORD
            });
            console.error('ERROR: Login with old password should have failed!');
        } catch (e: any) {
            console.log('Login with old password failed as expected:', e.message);
        }

        // 6. Login with NEW password (should succeed)
        console.log('6. Attempting login with NEW password...');
        const loginRes = await post(`${API_URL}/login`, {
            email: EMAIL,
            password: NEW_PASSWORD
        });
        console.log('Login with new password successful!', loginRes.user.email);

    } catch (error: any) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
};

runTest();
