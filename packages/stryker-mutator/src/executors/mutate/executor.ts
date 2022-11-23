import {ExecutorContext} from "@nrwl/devkit";
import * as path from "path";
import {MutateExecutorSchema} from "./schema";
import {execSync} from "child_process";
import {ModuleKind, transpileModule, TranspileOptions} from "typescript"
import {readFileSync, writeFileSync, rmSync, existsSync} from "fs";
import {fileExists} from "@nrwl/nx-plugin/testing";

process.env.NODE_ENV ??= 'test';

export async function strykerExecutor(
  options: MutateExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  const strykerConfigPath = path.resolve(context.root, options.strykerConfig);

  //TODO: change this to use @stryker-mutator/core api
  const strykerConfig = await import(strykerConfigPath);

  let strykerCommand = `npx stryker run ${strykerConfigPath}`

  existsSync(strykerConfig?.["jest"]?.["configFile"]?.endsWith(".ts"))

  let needsTranspiling = false;
  const jestConfigJsPath = `${context.root}/${options.strykerConfig.replace("/stryker.config.js", "")}/jest.config.js`;

  if (existsSync(strykerConfig?.["jest"]?.["configFile"]?.endsWith(".ts"))) {
    needsTranspiling = true

    const jestConfig = readFileSync(strykerConfig?.["jest"]?.["configFile"].replace(".js", ".ts")).toString();

    let result = tsCompile(jestConfig);
    result = result.replace("exports.default", "module.exports")
    result = result.replace("Object.defineProperty(exports, \"__esModule\", { value: true });", "")
    result = result.replace("\"use strict\";", "")


    writeFileSync(jestConfigJsPath, result)

    strykerCommand = `npx stryker run ${jestConfigJsPath}`
  }

  if (options.incremental) {
    strykerCommand += ` --incremental`
  }

  if (options.mutate && options.mutate !== '') {
    strykerCommand += ` --mutate ${options.mutate}`
  }

  try {
    execSync(strykerCommand, {stdio: [0, 1, 2]})

    if(needsTranspiling){
      rmSync(jestConfigJsPath)
    }

  } catch (error) {
    if(existsSync(jestConfigJsPath)){
      rmSync(jestConfigJsPath)
    }
    return {
      success: false
    }
  }

  if(existsSync(jestConfigJsPath)){
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
