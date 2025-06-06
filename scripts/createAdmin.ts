import 'dotenv/config';
import { loadSequelize } from '../src/loaders/sequelize';
import { config } from '../src/config';
import { User, UserRole } from '../src/models/user.model';
import bcrypt from 'bcrypt';

async function createAdmin() {
  const sequelize = loadSequelize(config); // 👈 подключение базы
  await sequelize.authenticate();

  User.defineSchema(sequelize);

  const passwordHash = await bcrypt.hash('adminpassword', 10);
  await User.create({
    email: 'admin2@example.com',
    password: passwordHash,
    role: UserRole.Admin,
    firstName: 'Admin',
    lastName: 'User',
    title: 'Administrator',
    summary: 'Super user',
    image: '/uploads/default-avatar.png',
  });

  console.log('Admin created');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
