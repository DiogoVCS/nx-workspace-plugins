import {ExecutorContext} from "@nrwl/devkit";
import * as path from "path";
import {MutateExecutorSchema} from "./schema";
import {execSync} from "child_process";
import {ModuleKind, transpileModule, TranspileOptions} from "typescript"
import {existsSync, readFileSync, rmSync, writeFileSync} from "fs";

process.env.NODE_ENV ??= 'test';

export async function strykerExecutor(
  options: MutateExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  const strykerConfigPath = path.resolve(context.root, options.strykerConfig);

  //TODO: change this to use @stryker-mutator/core api
  const strykerConfig = await import(strykerConfigPath);

  let strykerCommand = `npx stryker run ${strykerConfigPath}`
  let needsTranspiling = false;
  let jestConfigJsPath;

  if (strykerConfig?.["jest"]?.["configFile"]) {

    const originalJestConfigPath = path.resolve(context.root, strykerConfig?.["jest"]?.["configFile"]);


    jestConfigJsPath = `${originalJestConfigPath.replace("/jest.config.ts", "/jest.config.js")}`;
    const jestConfigTsPath = `${originalJestConfigPath.replace("/jest.config.js", "/jest.config.ts")}`;

    if (existsSync(jestConfigTsPath)) {
      needsTranspiling = true

      const jestConfig = readFileSync(jestConfigTsPath).toString();

      let result = tsCompile(jestConfig);
      result = result.replace("exports.default", "module.exports")
      result = result.replace("Object.defineProperty(exports, \"__esModule\", { value: true });", "")
      result = result.replace("\"use strict\";", "")

      writeFileSync(jestConfigJsPath, result)
    }
  }

  if (options.incremental) {
    strykerCommand += ` --incremental`
  }

  if (options.mutate && options.mutate !== '') {
    strykerCommand += ` --mutate ${options.mutate}`
  }

  try {
    execSync(strykerCommand, {stdio: [0, 1, 2]})

    if (needsTranspiling && jestConfigJsPath) {
      rmSync(jestConfigJsPath)
    }

  } catch (error) {
    if (needsTranspiling && jestConfigJsPath && existsSync(jestConfigJsPath)) {
      rmSync(jestConfigJsPath)
    }
    return {
      success: false
    }
  }

  if (needsTranspiling && jestConfigJsPath && existsSync(jestConfigJsPath)) {
    rmSync(jestConfigJsPath)
  }

  return {
    success: true,
  };
}


function tsCompile(source: string, options: TranspileOptions = null): string {
  // Default options -- you could also perform a merge, or use the project tsconfig.json
  if (null === options) {
    options = {compilerOptions: {module: ModuleKind.CommonJS}};
  }
  return transpileModule(source, options).outputText;
}


export default strykerExecutor;
