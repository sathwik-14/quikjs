import { install } from '../../utils/install';

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  exec: jest.fn(),
}));

describe('install', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log error if installation fails', () => {
    const packages = ['invalid-package'];
    const mockExecSync = require('child_process').execSync;

    mockExecSync.mockImplementation(() => {
      throw new Error('Installation failed');
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    install(packages, { sync: true });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error installing packages:',
      'invalid-package',
    );

    consoleErrorSpy.mockRestore();
  });

  it('should install packages successfully when options.sync is false', () => {
    const packages = ['valid-package'];

    const mockExecSync = require('child_process').execSync;
    mockExecSync.mockImplementation(() => {
      console.log(`Successfully installed npm package`);
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    install(packages, { sync: false });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
