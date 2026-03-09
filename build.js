import { cpSync, copyFileSync, existsSync, mkdirSync } from 'fs';

// Static build - no processing, just copy files to dist
console.log('Building static site...');

try {
  // Create dist
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Copy main index.html
  copyFileSync('index.html', 'dist/index.html');
  console.log('✓ index.html');
  
  // Copy project files
  copyFileSync('proyecto-personal-shopper.html', 'dist/proyecto-personal-shopper.html');
  copyFileSync('proyecto-bordados-pando.html', 'dist/proyecto-bordados-pando.html');
  copyFileSync('proyecto-arrancandonga.html', 'dist/proyecto-arrancandonga.html');
  console.log('✓ project files');
  
  // Copy knowledge base
  copyFileSync('knowledge_base.json', 'dist/knowledge_base.json');
  console.log('✓ knowledge_base.json');
  
  // Copy folders
  cpSync('admin', 'dist/admin', { recursive: true });
  cpSync('onboarding', 'dist/onboarding', { recursive: true });
  cpSync('quote', 'dist/quote', { recursive: true });
  cpSync('documentation', 'dist/documentation', { recursive: true });
  cpSync('api', 'dist/api', { recursive: true });
  console.log('✓ folders copied');
  
  console.log('\n✓ Build complete!');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
