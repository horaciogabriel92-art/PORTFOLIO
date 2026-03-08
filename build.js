import { execSync } from 'child_process';
import { cpSync, copyFileSync, existsSync } from 'fs';

console.log('Running Vite build...');
execSync('vite build', { stdio: 'inherit' });

console.log('Copying static files...');
try {
  cpSync('admin', 'dist/admin', { recursive: true });
  cpSync('quote', 'dist/quote', { recursive: true });
  cpSync('documentation', 'dist/documentation', { recursive: true });
  
  // Copy standalone HTML files
  if (existsSync('proyecto-bordados-pando.html')) {
    copyFileSync('proyecto-bordados-pando.html', 'dist/proyecto-bordados-pando.html');
  }
  
  console.log('✓ All files copied to dist/');
} catch (e) {
  console.error('Error copying files:', e.message);
}
