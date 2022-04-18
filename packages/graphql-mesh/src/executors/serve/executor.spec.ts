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
    const output = await executor(options);

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `mesh dev --dir ${options.meshYmlPath}`, expect.any(Function))
  });

  it('should apply the file type', async () => {
    const port = 4000;

    mockPromisify("Done!")
    const output = await executor({...options, port});

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(` --port ${port}`), expect.any(Function))
  });
});
