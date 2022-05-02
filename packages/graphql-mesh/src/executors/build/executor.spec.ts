import {BuildExecutorSchema, FileTypeSchema} from './schema';
import * as executor from './executor';
import * as child_process from "child_process";
import {ExecSyncOptionsWithBufferEncoding} from "child_process";
import * as tsc_alias from "tsc-alias";
import * as fs from "fs";
import Mock = jest.Mock;

jest.mock('fs')
jest.mock("child_process")
jest.mock("tsc-alias")

const options: BuildExecutorSchema = {
  meshYmlPath: "some/path",
  rootPath: "some/path",
  tsconfigPath: "some/path",
  outputPath: "dist/some/path",
  typescriptSupport: true
};

const execSyncOptions: ExecSyncOptionsWithBufferEncoding = {stdio: [0, 1, 2]}

function mockPromisify(stdout: string) {
  (child_process.exec as unknown as Mock).mockImplementation((command, callback) => callback(null, {stdout}))
}

describe('Build Executor', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  beforeEach(() => {
    (tsc_alias.replaceTscAliasPaths as unknown as Mock) = jest.fn()
  })

  it('can run', async () => {

    mockPromisify("Done!");
    (child_process.execSync as unknown as Mock).mockImplementation((command, options) => null);
    const output = await executor.default(options);

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(2, `npx --package=yamlinc -c 'yamlinc --output ./dist/some/path/.meshrc.yml ./some/path/.meshrc.yml --strict'`, expect.objectContaining({...execSyncOptions}))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `mesh build --dir dist/some/path`, expect.any(Function))
    expect(output.success).toBe(true);
  });

  it('should apply the file type', async () => {
    const fileType: FileTypeSchema = "json";

    mockPromisify("Done!");
    (child_process.execSync as unknown as Mock).mockImplementation((command, options) => null);
    const output = await executor.default({...options, fileType});

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(1, `npx --package=yamlinc -c 'yamlinc --output ./dist/some/path/.meshrc.yml ./some/path/.meshrc.yml --strict'`, expect.objectContaining({...execSyncOptions}))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(` --fileType ${fileType}`), expect.any(Function))
    expect(output.success).toBe(true);
  });

  it('should apply the env file', async () => {
    const envFile = "./some-path/.env";

    mockPromisify("Done!");
    (child_process.execSync as unknown as Mock).mockImplementation((command, options) => null);
    const output = await executor.default({...options, envFile});

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(1, `npx --package=yamlinc -c 'yamlinc --output ./dist/some/path/.meshrc.yml ./some/path/.meshrc.yml --strict'`, expect.objectContaining({...execSyncOptions}))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(`env-cmd ${envFile}`), expect.any(Function))
    expect(output.success).toBe(true);
  });

  it("should fail executor if mesh command fails", async () => {
    mockPromisify("Not working")
    const output = await executor.default(options);

    expect(output.success).toBe(false);
  });

  describe('when running for single mesh file', () => {
    it("should copy the meshrc file to the dist folder", async () => {
      mockPromisify("Done!");
      (child_process.execSync as unknown as Mock).mockImplementation((command, options) => null);
      (fs.copyFileSync as unknown as Mock) = jest.fn();
      await executor.default({...options, singleMeshFile: true});

      expect(fs.copyFileSync).toHaveBeenNthCalledWith(2, `${options.meshYmlPath}/.meshrc.yml`, `dist/${options.meshYmlPath}/.meshrc.yml`)
    })
  })

  describe('when typescript support is set to false', () => {
    it("should set the dir flag to the app directory", async () => {
      mockPromisify("Done!");
      (child_process.execSync as unknown as Mock).mockImplementation((command, options) => null);
      (fs.copyFileSync as unknown as Mock) = jest.fn();
      await executor.default({...options, typescriptSupport: false});

      expect(child_process.exec).toHaveBeenNthCalledWith(1, `mesh build --dir ${options.meshYmlPath}`, expect.any(Function))
    })
  })
});
