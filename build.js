import { execSync } from 'child_process';
import { cpSync, copyFileSync, existsSync, mkdirSync } from 'fs';

console.log('Running Vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (e) {
  console.error('Vite build failed:', e.message);
  process.exit(1);
}

console.log('Copying static files...');
try {
  // Ensure dist exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Copy folders
  if (existsSync('onboarding')) {
    cpSync('onboarding', 'dist/onboarding', { recursive: true });
    console.log('✓ onboarding/ copied');
  }
  if (existsSync('admin')) {
    cpSync('admin', 'dist/admin', { recursive: true });
    console.log('✓ admin/ copied');
  }
  if (existsSync('documentation')) {
    cpSync('documentation', 'dist/documentation', { recursive: true });
    console.log('✓ documentation/ copied');
  }
  if (existsSync('quote')) {
    cpSync('quote', 'dist/quote', { recursive: true });
    console.log('✓ quote/ copied');
  }
  
  // Copy project HTML files
  if (existsSync('proyecto-bordados-pando.html')) {
    copyFileSync('proyecto-bordados-pando.html', 'dist/proyecto-bordados-pando.html');
    console.log('✓ proyecto-bordados-pando.html copied');
  }
  if (existsSync('proyecto-personal-shopper.html')) {
    copyFileSync('proyecto-personal-shopper.html', 'dist/proyecto-personal-shopper.html');
    console.log('✓ proyecto-personal-shopper.html copied');
  }
  if (existsSync('proyecto-arrancandonga.html')) {
    copyFileSync('proyecto-arrancandonga.html', 'dist/proyecto-arrancandonga.html');
    console.log('✓ proyecto-arrancandonga.html copied');
  }
  
  // Copy knowledge base
  if (existsSync('knowledge_base.json')) {
    copyFileSync('knowledge_base.json', 'dist/knowledge_base.json');
    console.log('✓ knowledge_base.json copied');
  }
  
  // List dist contents
  console.log('\nDist folder contents:');
  const distFiles = await import('fs/promises').then(fs => fs.readdir('dist'));
  distFiles.forEach(f => console.log(`  - ${f}`));
  
  console.log('\n✓ Build completed successfully!');
} catch (e) {
  console.error('Error copying files:', e.message);
  process.exit(1);
}
