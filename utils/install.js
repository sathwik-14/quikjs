import { execSync, exec } from 'child_process';

const install = (packages, options = { sync: true }) => {
  try {
    packages.forEach((pkg) => {
      if (options.sync) execSync(`npm install ${pkg}`);
      else exec(`npm install ${pkg}`);
    });
  } catch {
    console.error('Error installing packages:', ...packages);
  }
};

export { install };
