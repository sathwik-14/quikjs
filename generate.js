const inquirer = require('inquirer');

async function promptModelForm() {
    const formData = await inquirer.prompt([
        {
          type: 'input',
          name: 'model_name',
          message: 'Enter model name:',
          validate: value => value ? true : 'Model name is required'
        },
        {
          type: 'input',
          name: 'model_desc',
          message: 'Enter model description:'
        },
        {
          type: 'confirm',
          name: 'add_field',
          message: 'Do you want to add a field?',
          default: false
        }
      ]);
    
      const fieldData = [];
    
      while (formData.add_field) {
        const newFieldData = await inquirer.prompt([
          {
            type: 'input',
            name: 'field_name',
            message: 'Enter field name:',
            validate: value => value ? true : 'Field name is required'
          },
          {
            type: 'list',
            name: 'field_type',
            message: 'Select field type:',
            choices: ['string', 'number', 'boolean', 'date'] // Example field types, adjust as needed
          },
          {
            type: 'confirm',
            name: 'add_another_field',
            message: 'Do you want to add another field?',
            default: false
          }
        ]);
    
        fieldData.push(newFieldData);
    
        if (newFieldData.add_another_field) {
          formData.add_field = true;
        } else {
          formData.add_field = false;
        }
      }
    
      formData.fields = fieldData;
      return formData;
    }

async function main() {
  const formData = await promptModelForm();
  console.log('Form Data:', formData);
}

main();
