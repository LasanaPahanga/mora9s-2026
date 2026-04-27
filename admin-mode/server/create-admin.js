import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function createAdmin() {
  const username = 'admin';
  const password = 'admin123';
  
  // Generate hash
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  
  console.log('Creating admin user...');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('Hash:', password_hash);
  
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'mora9s_2026'
    });
    
    // Delete existing admin users
    await connection.execute('DELETE FROM admin_users');
    
    // Insert new admin user
    await connection.execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, password_hash]
    );
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
