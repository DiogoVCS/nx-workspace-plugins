import {ExecutorContext, logger} from "@nrwl/devkit";
import * as path from "path";
import {MutateExecutorSchema} from "./schema";
import {execSync} from "child_process";

process.env.NODE_ENV ??= 'test';

export async function strykerExecutor(
  options: MutateExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  const strykerConfigPath = path.resolve(context.root, options.strykerConfig);

  //TODO: change this to use @stryker-mutator/core api
  // const strykerConfig = await import(strykerConfigPath);

  let strykerCommand = `npx stryker run ${strykerConfigPath}`

  if (options.incremental) {
    strykerCommand += ` --incremental`
  }

  if (options.mutate && options.mutate !== '') {
    strykerCommand += ` --mutate ${options.mutate}`
  }

  try {
    execSync(strykerCommand, {stdio: [0, 1, 2]})

  } catch (error) {
    logger.error("Stryker was unable to run the mutation test. " + error);

    return {
      success: false
    }
  }

  return {
    success: true,
  };
}

export default strykerExecutor;
