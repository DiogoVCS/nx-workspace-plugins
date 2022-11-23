import {ExecutorContext} from "@nrwl/devkit";
import * as path from "path";
import {MutateExecutorSchema} from "./schema";
import {execSync} from "child_process";
import {Stryker} from "@stryker-mutator/core";
import {transpile} from "typescript"

process.env.NODE_ENV ??= 'test';

export async function strykerExecutor(
  options: MutateExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  const strykerConfigPath = path.resolve(context.root, options.strykerConfig);
  const tsConfigPath = path.resolve(context.root, options["tsConfig"]);

  //TODO: change this to use @stryker-mutator/core api
  const strykerConfig = await import(strykerConfigPath);

  let strykerCommand = `npx stryker run ${strykerConfigPath}`


  if (strykerConfig?.["jest"]?.["configFile"]?.endsWith(".ts")) {
    transpile(strykerConfig["jest"]["configFile"], {outFile: `dist/${strykerConfigPath}`, project: tsConfigPath})

    strykerCommand = `npx stryker run dist/${strykerConfigPath}`
  }

  if (options.incremental) {
    strykerCommand += ` --incremental`
  }

  if (options.mutate && options.mutate !== '') {
    strykerCommand += ` --mutate ${options.mutate}`
  }

  try {
    execSync(strykerCommand, {stdio: [0, 1, 2]})

  } catch (error) {
    return {
      success: false
    }
  }

  return {
    success: true,
  };
}

export default strykerExecutor;
