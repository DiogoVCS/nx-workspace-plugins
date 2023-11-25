import executor from './executor';
import {ExecutorContext} from "@nrwl/devkit";

const context: ExecutorContext = {} as ExecutorContext

//FIXME: Fix and create more tests.
describe.skip('Build Executor', () => {
  it('can run', async () => {
    const output = await executor({mutate: "", incremental: true, strykerConfig: ""}, context);
    expect(output.success).toBe(true);
  });
});
