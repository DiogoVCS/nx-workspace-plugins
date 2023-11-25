import {ServeExecutorSchema} from './schema';
import executor from './executor';
import * as child_process from "child_process";
import Mock = jest.Mock;

jest.mock("child_process")
const options: ServeExecutorSchema = {
  meshYmlPath: "some/path",
  tsConfigPath: "some/ts/path",
  rootPath: "some/root/path",
  mainPath: "some/main/path"
};

function mockPromisify(stdout: string) {
  (child_process.execSync as unknown as Mock).mockImplementation((command, options) => jest.fn);
}

describe('Serve Executor', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('can run', async () => {

    mockPromisify("Done!")
    await executor(options);

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(2, `npm run ts-node-dev -- --project ${options.tsConfigPath} --log-error --watch ${options.rootPath} ${options.mainPath}`, {stdio: [0, 1, 2]})
  });

  it('should apply the project and watch for file changes', async () => {
    mockPromisify("Done!")
    await executor({...options});

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(` --project ${options.tsConfigPath} --log-error --watch ${options.rootPath} ${options.mainPath}`), {stdio: [0, 1, 2]})
  });
});
