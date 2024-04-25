import { execSync, exec } from "child_process";

export const install = (...packages) => {
  try {
    packages.forEach((pkg) => {
      exec(`npm install ${pkg}`);
    });
  } catch (error) {
    console.error("Error installing packages:", ...packages);
  }
};
export const installSync = (...packages) => {
  try {
    packages.forEach((pkg) => {
      execSync(`npm install ${pkg}`);
    });
  } catch (error) {
    console.error("Error installing packages:", ...packages);
  }
};
