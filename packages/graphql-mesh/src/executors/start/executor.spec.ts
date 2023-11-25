import {StartExecutorSchema} from './schema';
import executor from './executor';
import * as child_process from "child_process";
import * as dotenv from 'dotenv';
import Mock = jest.Mock;

jest.mock("child_process")
const options: StartExecutorSchema = {
  meshYmlPath: "some/path",
  typescriptSupport: true,
  envFile: undefined
};

function mockPromisify() {
  (child_process.execSync as unknown as Mock).mockImplementation((_command, _options) => jest.fn())
}

describe('Serve Executor', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('can run', async () => {

    mockPromisify()
    await executor(options);

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(2, `mesh start --dir dist/${options.meshYmlPath}`, {stdio: [0, 1, 2]})
  });

  it('should be able to read env files and include them', async () => {
    const envFile = "./some-path/.env";

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dotenv.config = jest.fn().mockReturnValue({
      parsed: {
        KEY: "VALUE"
      }
    })
    mockPromisify()
    await executor({...options, envFile});

    expect((child_process.execSync as unknown as Mock)).toHaveBeenNthCalledWith(1, expect.stringContaining(`KEY=VALUE `), {stdio: [0, 1, 2]})
  });
});
