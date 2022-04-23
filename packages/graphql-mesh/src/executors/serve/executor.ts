import {ServeExecutorSchema} from './schema';
import {promisify} from "util";
import {exec} from "child_process";

export default async function runExecutor(options: ServeExecutorSchema) {

  let serveCommand = `mesh dev --dir ${options.meshYmlPath}`;
  if (options.port) {
    serveCommand += ` --port ${options.port}`
  }

  if (options.envFile) {
    serveCommand = `env-cmd ${options.envFile} ${serveCommand}`
  }

  await promisify(exec)(serveCommand);
}
