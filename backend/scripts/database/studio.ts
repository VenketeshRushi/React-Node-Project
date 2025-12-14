import { exec } from 'child_process';

const startDrizzleStudio = () => {
  console.log('Starting Drizzle Studio...');
  console.log('Studio will be available at: https://local.drizzle.studio');

  exec('npx drizzle-kit studio', (error, stdout, stderr) => {
    if (error) {
      console.error('Error starting Drizzle Studio:', error.message);
      return;
    }
    if (stderr) {
      console.error('Drizzle Studio stderr:', stderr);
      return;
    }
    console.log(stdout);
  });
};

startDrizzleStudio();
