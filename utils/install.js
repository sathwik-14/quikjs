import { execSync } from "child_process";

export default (...packages) => {
  try {
    packages.forEach((pkg) => {
      execSync(`npm install ${pkg}`);
    });
  } catch (error) {
    console.error("Error installing packages:", ...packages);
  }
};
