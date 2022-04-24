import {checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq,} from '@nrwl/nx-plugin/testing';

describe('graphql-mesh e2e', () => {

  describe("--singleMeshFile=false", () => {
    it('should create graphql-mesh', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin}`
      );
      const result = await runNxCommandAsync(`build ${plugin}`);
      expect(result.stdout).toContain(`Successfully ran target build for project ${plugin}`);
    }, 200000);


    it('should be able to test graphql-mesh', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin}`
      );
      const result = await runNxCommandAsync(`test ${plugin} -u`);

      expect(result.stdout).toContain(`Successfully ran target test for project ${plugin}`);
    }, 200000);
  })

  describe("--singleMeshFile=true", () => {
    it('should create graphql-mesh', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin} --singleMeshFile`
      );
      const result = await runNxCommandAsync(`build ${plugin}`);
      expect(result.stdout).toContain(`Successfully ran target build for project ${plugin}`);
    }, 200000);

    it('should be able to test graphql-mesh', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin} --singleMeshFile`
      );
      const result = await runNxCommandAsync(`test ${plugin} -u`);

      expect(result.stdout).toContain(`Successfully ran target test for project ${plugin}`);
    }, 200000);
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`apps/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('graphql-mesh');
      ensureNxProject('@diogovcs/graphql-mesh', 'dist/packages/graphql-mesh');
      await runNxCommandAsync(
        `generate @diogovcs/graphql-mesh:graphql-mesh ${plugin} --tags e2etag,e2ePackage`
      );
      const project = readJson(`apps/${plugin}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
