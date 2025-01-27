const requiredEnvVars = ['DATABASE_URL'];

function checkEnv() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(envVar => {
      console.error(`- ${envVar}`);
    });
    console.error('\nPlease set these environment variables in your deployment platform.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

checkEnv(); 