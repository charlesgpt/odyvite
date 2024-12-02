import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Get all HTML files in the root directory
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// Create input object for all HTML files
const input = {
  // Set welcome-screen as the index (default) entry point
  index: resolve(__dirname, 'welcome-screen.html')
};

// Add other HTML files as additional entry points
htmlFiles.forEach(file => {
  if (file !== 'welcome-screen.html') {
    input[file.replace('.html', '')] = resolve(__dirname, file);
  }
});

export default defineConfig({
  build: {
    rollupOptions: {
      input
    }
  },
  // Ensure public directory is handled correctly
  publicDir: 'public',
  // Configure asset handling
  assetsInclude: ['**/*.ttf', '**/*.png', '**/*.svg'],
  // Base config for assets
  base: './',
  // Add server configuration to handle SPA-style routing
  server: {
    open: '/welcome-screen.html' // This will open welcome-screen.html by default
  }
});
