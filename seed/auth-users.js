/**
 * Crear usuarios de prueba en Firebase Auth Emulator
 * Ejecutar: node auth-users.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  updateProfile
} = require('firebase/auth');

const firebaseConfig = {
  projectId: 'bordados-pando-demo',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099');

const users = [
  {
    email: 'admin@bordadospando.com',
    password: 'admin123456',
    displayName: 'Administrador',
    role: 'admin'
  },
  {
    email: 'gerente@bordadospando.com',
    password: 'gerente123',
    displayName: 'Gerente de Producción',
    role: 'manager'
  },
  {
    email: 'taller@bordadospando.com',
    password: 'taller123',
    displayName: 'Operario Taller',
    role: 'operator'
  },
  {
    email: 'pedidos@bordadospando.com',
    password: 'pedidos123',
    displayName: 'Responsable de Pedidos',
    role: 'manager'
  }
];

async function createUsers() {
  console.log('👤 Creando usuarios de prueba...\n');

  for (const user of users) {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      
      await updateProfile(newUser, {
        displayName: user.displayName
      });

      console.log(`✅ ${user.displayName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Rol: ${user.role}\n`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  ${user.email} ya existe (omitido)\n`);
      } else {
        console.error(`❌ Error creando ${user.email}:`, error.message);
      }
    }
  }

  console.log('🎉 Usuarios creados correctamente!');
  console.log('\n📋 Credenciales para login:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@bordadospando.com / admin123456');
  console.log('Gerente:   gerente@bordadospando.com / gerente123');
  console.log('Taller:    taller@bordadospando.com / taller123');
  console.log('Pedidos:   pedidos@bordadospando.com / pedidos123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  process.exit(0);
}

createUsers().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
