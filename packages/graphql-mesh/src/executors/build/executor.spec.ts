import {BuildExecutorSchema, FileTypeSchema} from './schema';
import executor from './executor';
import * as child_process from "child_process";
import Mock = jest.Mock;

jest.mock('fs')
jest.mock("child_process")

const options: BuildExecutorSchema = {
  meshYmlPath: "some/path"
};

function mockPromisify(stdout: string) {
  (child_process.exec as unknown as Mock).mockImplementation((command, callback) => callback(null, {stdout}))
}

describe('Build Executor', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('can run', async () => {

    mockPromisify("Done!")
    const output = await executor(options);

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `yamlinc --output ./some/.compiled/.meshrc.yml ./some/path/.meshrc.yml --strict`, expect.any(Function))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(2, `mesh build --dir some/.compiled`, expect.any(Function))
    expect(output.success).toBe(true);
  });

  it('should apply the file type', async () => {
    const fileType: FileTypeSchema = "json";

    mockPromisify("Done!")
    const output = await executor({...options, fileType});

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `yamlinc --output ./some/.compiled/.meshrc.yml ./some/path/.meshrc.yml --strict`, expect.any(Function))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(2, expect.stringContaining(` --fileType ${fileType}`), expect.any(Function))
    expect(output.success).toBe(true);
  });

  it('should apply the env file', async () => {
    const envFile = "./some-path/.env";

    mockPromisify("Done!")
    const output = await executor({...options, envFile});

    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(1, `yamlinc --output ./some/.compiled/.meshrc.yml ./some/path/.meshrc.yml --strict`, expect.any(Function))
    expect((child_process.exec as unknown as Mock)).toHaveBeenNthCalledWith(2, expect.stringContaining(`env-cmd ${envFile}`), expect.any(Function))
    expect(output.success).toBe(true);
  });

  it("should fail executor if mesh command fails", async () => {
    mockPromisify("Not working")
    const output = await executor(options);

    expect(output.success).toBe(false);
  });
});
