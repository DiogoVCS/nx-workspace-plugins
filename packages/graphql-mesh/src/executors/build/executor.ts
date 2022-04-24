import {BuildExecutorSchema} from './schema';
import {promisify} from "util";
import {exec} from "child_process";
import {existsSync, mkdirSync, writeFileSync} from "fs"

export default async function runExecutor(options: BuildExecutorSchema) {
//.replace(".meshrc.yml", ".meshrc.compiled.yml")

  let compiledYmlPath = options.meshYmlPath;

  if (!options.singleMeshFile) {
    const splitted = options.meshYmlPath.split("/")
    if (splitted.length) {
      splitted.pop();
      compiledYmlPath = splitted.join("/")
    }

    compiledYmlPath = `${compiledYmlPath}/.compiled`
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

    const yamLincResult = await promisify(exec)(`yamlinc --output ./${compiledYmlPath}/.meshrc.yml ./${options.meshYmlPath}/.meshrc.yml --strict`)
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
