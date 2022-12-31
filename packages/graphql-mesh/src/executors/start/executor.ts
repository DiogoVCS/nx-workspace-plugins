import {StartExecutorSchema} from './schema';
import * as dotenv from 'dotenv';
import {logger} from "@nrwl/devkit";
import {execSync} from "child_process";

export default async function runExecutor(options: StartExecutorSchema) {
  let startCommand = `mesh start`;

  try {
    if (options.envFile) {
      const envConfig = dotenv.config({path: `./${options.envFile}`})

      if (envConfig.error) {
        logger.warn(`Error reading .env file: ${envConfig.error}`);
      } else if (envConfig.parsed) {
        for (const key of Object.keys(envConfig.parsed)) {
          startCommand = `${key}=${envConfig.parsed[key]} ${startCommand}`
        }
      }
    }

    const buildArgs = ["start"];
    if (options.typescriptSupport) {
      startCommand = `${startCommand} --dir dist/${options.meshYmlPath}`
    } else {
      startCommand = `${startCommand} --dir ${options.meshYmlPath}`
    }

    execSync(startCommand, {stdio: [0, 1, 2]})
  } catch (e) {
    return {
      success: false
    }
  }

  return {
    success: true,
  };
}
