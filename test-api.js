// Test script to verify Watsonx API configuration
// Run with: node test-api.js

require('dotenv').config({ path: '.env.local' });

console.log('\n=== WATSONX API CONFIGURATION TEST ===\n');

const apiKey = process.env.WATSONX_API_KEY;
const projectId = process.env.WATSONX_PROJECT_ID;
const url = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
const modelId = process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-chat-v2';

console.log('Environment Variables:');
console.log('  WATSONX_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}... (${apiKey.length} chars)` : '❌ NOT SET');
console.log('  WATSONX_PROJECT_ID:', projectId ? `${projectId.substring(0, 10)}... (${projectId.length} chars)` : '❌ NOT SET');
console.log('  WATSONX_URL:', url);
console.log('  WATSONX_MODEL_ID:', modelId);

console.log('\nValidation:');
const hasApiKey = apiKey && apiKey !== 'your_api_key_here';
const hasProjectId = projectId && projectId !== 'your_project_id_here';

console.log('  ✓ API Key valid:', hasApiKey ? '✅ YES' : '❌ NO');
console.log('  ✓ Project ID valid:', hasProjectId ? '✅ YES' : '❌ NO');

if (hasApiKey && hasProjectId) {
  console.log('\n✅ Configuration looks good! Watsonx API should work.');
  console.log('\nNext steps:');
  console.log('  1. Upload a ZIP file in the app');
  console.log('  2. Check the terminal/console for detailed logs');
  console.log('  3. Look for "🚀 Attempting to call Watsonx.ai API..."');
} else {
  console.log('\n❌ Configuration incomplete!');
  console.log('\nTo fix:');
  console.log('  1. Open .env.local');
  console.log('  2. Replace "your_api_key_here" with your actual IBM Cloud API key');
  console.log('  3. Replace "your_project_id_here" with your Watsonx project ID');
  console.log('  4. Restart the dev server (npm run dev)');
}

console.log('\n=====================================\n');

// Made with Bob
