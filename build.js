import { execSync } from 'child_process';
import { cpSync, copyFileSync, existsSync } from 'fs';

console.log('Running Vite build...');
execSync('vite build', { stdio: 'inherit' });

console.log('Copying static files...');
try {
  // Copy folders
  cpSync('onboarding', 'dist/onboarding', { recursive: true });
  cpSync('admin', 'dist/admin', { recursive: true });
  cpSync('documentation', 'dist/documentation', { recursive: true });
  cpSync('quote', 'dist/quote', { recursive: true });
  
  // Copy project HTML files
  if (existsSync('proyecto-bordados-pando.html')) {
    copyFileSync('proyecto-bordados-pando.html', 'dist/proyecto-bordados-pando.html');
  }
  if (existsSync('proyecto-personal-shopper.html')) {
    copyFileSync('proyecto-personal-shopper.html', 'dist/proyecto-personal-shopper.html');
  }
  if (existsSync('proyecto-arrancandonga.html')) {
    copyFileSync('proyecto-arrancandonga.html', 'dist/proyecto-arrancandonga.html');
  }
  
  // Copy knowledge base
  if (existsSync('knowledge_base.json')) {
    copyFileSync('knowledge_base.json', 'dist/knowledge_base.json');
  }
  
  console.log('✓ All files copied to dist/');
} catch (e) {
  console.error('Error copying files:', e.message);
}
