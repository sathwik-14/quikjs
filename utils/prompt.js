import inquirer from 'inquirer';

export const ask = async (questions) => {
	const answers = await inquirer.prompt(questions);
	return answers;
};
