const readline = require('readline');
const { addAdmin } = require('./db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('=== Create Admin Account ===\n');

rl.question('Enter admin username: ', (username) => {
    rl.question('Enter admin email (optional): ', (email) => {
        rl.question('Enter admin password: ', async (password) => {
            try {
                await addAdmin(username, password, email || null);
                console.log('\n Admin account created successfully!');
                console.log(`Username: ${username}`);
                console.log(`Email: ${email || 'N/A'}`);
            } catch (error) {
                console.error('\n Error creating admin:', error.message);
            } finally {
                rl.close();
                process.exit();
            }
        });
    });
});
