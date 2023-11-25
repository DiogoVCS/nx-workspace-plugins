import {ensureNxProject, runNxCommandAsync, runPackageManagerInstall, uniq,} from '@nrwl/nx-plugin/testing';

const rootFolderPath = '../../..'

//FIXME: fix these tests
describe.skip('stryker-mutator e2e', () => {
  it('should create stryker-mutator', async () => {
    const application = uniq('stryker-mutator');

    ensureNxProject(
      '@diogovcs/stryker-mutator',
      'dist/packages/stryker-mutator'
    );

    await runNxCommandAsync(
      `generate @nrwl/angular:application ${application}`
    );

    runPackageManagerInstall(true);

    const result = await runNxCommandAsync(
      `generate @diogovcs/stryker-mutator:stryker-mutator ${application}`
    );

    expect(result.stdout).toContain(`UPDATE apps/${application}/project.json`);
    expect(result.stdout).toContain(`CREATE apps/${application}/stryker.config.js`);
  }, 300000);

  describe('mutate', () => {
    it('should create src in the specified directory', async () => {
      const application = uniq('stryker-mutator');

      ensureNxProject(
        '@diogovcs/stryker-mutator',
        'dist/packages/stryker-mutator'
      );

      await runNxCommandAsync(
        `generate @nrwl/angular:application ${application}`
      );

      runPackageManagerInstall(true);

      await runNxCommandAsync(
        `generate @diogovcs/stryker-mutator:stryker-mutator ${application}`
      );

      await runNxCommandAsync(
        `mutate ${application}`
      );

    }, 120000);
  });
});
