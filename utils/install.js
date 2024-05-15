import { execSync, exec } from 'child_process';

const install = (packages, options = { sync: true, dev: false }) => {
  try {
    packages.forEach((pkg) => {
      if (options.sync)
        execSync(`npm install ${options.dev ? '-D' : ''} ${pkg}`);
      else exec(`npm install ${options.dev ? '-D' : ''} ${pkg}`);
    });
  } catch {
    console.error('Error installing packages:', ...packages);
  }
};

export { install };
