// Simple test script to verify backend setup
const { spawn } = require('child_process');

console.log('🧪 Testing backend server startup...');

// Try to start the backend in development mode
const backend = spawn('npm', ['run', 'dev'], { 
  cwd: './backend',
  stdio: 'pipe'
});

let output = '';

backend.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📡 Backend output:', data.toString().trim());
});

backend.stderr.on('data', (data) => {
  console.error('❌ Backend error:', data.toString().trim());
});

// Wait a few seconds to see if it starts successfully
setTimeout(() => {
  console.log('\n✅ Backend test completed!');
  console.log('📋 Output summary:');
  console.log(output);
  
  // Kill the backend process
  backend.kill();
  process.exit(0);
}, 5000);

// Handle process exit
process.on('SIGINT', () => {
  backend.kill();
  process.exit(0);
}); 