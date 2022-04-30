import {BuildExecutorSchema} from './schema';
import {promisify} from "util";
import {exec, execSync} from "child_process";
import {existsSync, mkdirSync, writeFileSync} from "fs"
import {logger} from "@nrwl/devkit";

function constructCompiledYmlPath(meshYmlPath: string): string {
  let compiledYmlPath: string;

  const splitted = meshYmlPath.split("/")
  if (splitted.length) {
    splitted.pop();
    compiledYmlPath = splitted.join("/")
  }

  return `${compiledYmlPath}/.compiled`;
}

export default async function runExecutor(options: BuildExecutorSchema) {
  let compiledYmlPath = options.meshYmlPath;

  if (!options.singleMeshFile) {
    compiledYmlPath = constructCompiledYmlPath(options.meshYmlPath)
  }

  let buildCommand = `mesh build --dir ${compiledYmlPath}`;
  if (options.fileType) {
    buildCommand += ` --fileType ${options.fileType}`
  }

  if (options.envFile) {
    buildCommand = `env-cmd ${options.envFile} ${buildCommand}`
  }

  if (!options.singleMeshFile) {
    if (!existsSync(`./${compiledYmlPath}`)) {
      mkdirSync(`./${compiledYmlPath}`, {recursive: true});
    }

    writeFileSync(`./${compiledYmlPath}/.meshrc.yml`, "")

    const yamlincCommand = `yamlinc --output ./${compiledYmlPath}/.meshrc.yml ./${options.meshYmlPath}/.meshrc.yml --strict`

    try {
      logger.info(` > ${yamlincCommand}`)
      execSync(yamlincCommand, {stdio: [0, 1, 2]})
    } catch (e) {
      logger.error(`Failed to execute command: ${yamlincCommand}`);
      return {
        success: false
      }
    }
  }

  const result = await promisify(exec)(buildCommand);

  if (!result.stdout.includes("Done!")) {

    return {
      ...result,
      success: false
    }
  }

  return {
    ...result,
    success: true,
  };
}
