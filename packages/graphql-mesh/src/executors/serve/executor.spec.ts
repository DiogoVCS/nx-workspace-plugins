import {ServeExecutorSchema} from './schema';
import executor from './executor';
import * as child_process from "child_process";
import Mock = jest.Mock;

jest.mock("child_process")
const options: ServeExecutorSchema = {
  meshYmlPath: "some/path"
};

function mockPromisify(stdout: string) {
  (child_process.exec as unknown as Mock).mockImplementation((command, callback) => callback(null, {stdout}))
}

describe('Serve Executor', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('can run', async () => {

    mockPromisify("Done!")
    await executor(options);

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `mesh dev --dir ${options.meshYmlPath}`, expect.any(Function))
  });

  it('should apply the file type', async () => {
    const port = 4000;

    mockPromisify("Done!")
    await executor({...options, port});

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(` --port ${port}`), expect.any(Function))
  });

  it('should apply the env file', async () => {
    const envFile = "./some-path/.env";

    mockPromisify("Done!")
    await executor({...options, envFile});

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(`env-cmd ${envFile}`), expect.any(Function))
  });
});
