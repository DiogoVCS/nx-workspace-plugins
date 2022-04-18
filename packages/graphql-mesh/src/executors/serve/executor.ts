import {ServeExecutorSchema} from './schema';
import {promisify} from "util";
import {exec} from "child_process";

export default async function runExecutor(options: ServeExecutorSchema) {

  let serveCommand = `mesh dev --dir ${options.meshYmlPath}`;
  if (options.port) {
    serveCommand += ` --port ${options.port}`
  }

  await promisify(exec)(serveCommand);

  // if (!result.stdout.includes("Done!")) {
  //   return {
  //     ...result,
  //     success: false
  //   }
  // }
  //
  // return {
  //   ...result,
  //   success: true,
  // };
}
