import {ServeExecutorSchema} from './schema';
import {execSync} from "child_process";
import * as dotenv from 'dotenv';
import {getPackageManagerCommand, logger} from "@nrwl/devkit";

export default async function runExecutor(options: ServeExecutorSchema) {
  const packageManager = getPackageManagerCommand();

  if (options.envFile) {
    const envConfig = dotenv.config({path: `./${options.envFile}`})

    if (envConfig.error) {
      logger.warn(`Error reading .env file: ${envConfig.error}`);
    } else if (envConfig.parsed) {
      for (const key of Object.keys(envConfig.parsed)) {
        process.env[key] = envConfig.parsed[key]
      }
    }
  }

  //FIXME:
  // if (options.port) {
  //   serveCommand += ` --port ${options.port}`
  // }

  execSync(packageManager.run("ts-node-dev", `--project ${options.tsConfigPath} --log-error --watch ${options.rootPath} ${options.mainPath}`), {stdio: [0, 1, 2]});
}
