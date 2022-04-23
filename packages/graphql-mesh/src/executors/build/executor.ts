import {BuildExecutorSchema} from './schema';
import {promisify} from "util";
import {exec} from "child_process";

export default async function runExecutor(options: BuildExecutorSchema) {

  let buildCommand = `mesh build --dir ${options.meshYmlPath}`;
  if (options.fileType) {
    buildCommand += ` --fileType ${options.fileType}`
  }

  if (options.envFile) {
    buildCommand = `env-cmd ${options.envFile} ${buildCommand}`
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
