import inquirer from 'inquirer';

export default async (questions) => {
  const answers = await inquirer.prompt(questions);
  return answers;
};
