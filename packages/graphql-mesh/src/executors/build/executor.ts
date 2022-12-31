import {BuildExecutorSchema} from './schema';
import {execSync} from "child_process";
import {copyFileSync, existsSync, mkdirSync, readdirSync, statSync} from "fs"
import {detectPackageManager, getPackageManagerCommand, logger} from "@nrwl/devkit";
import {replaceTscAliasPaths,} from 'tsc-alias';
import * as path from "path";
import {PackageManagerCommands} from "nx/src/utils/package-manager";
import * as dotenv from "dotenv";
import {DEFAULT_CLI_PARAMS, graphqlMesh} from "@graphql-mesh/cli";

// eslint-disable-next-line
const tsc = require('node-typescript-compiler')


export default async function runExecutor(options: BuildExecutorSchema) {
  const packageManager = getPackageManagerCommand();

  if (!options.singleMeshFile) {
    constructMeshRcYamlFile(options.meshYmlPath, packageManager);
  }

  if (options.typescriptSupport) {
    await transpileTypescriptFiles(options);
    copyNonJavascriptFilesRecursiveSync(options.rootPath, options.outputPath, options.rootPath)
  }

  if (options.singleMeshFile) {
    copyFileSync(`${options.meshYmlPath}/.meshrc.yml`, `dist/${options.meshYmlPath}/.meshrc.yml`);
  }

  return runBuildCommand(options);
}

async function runBuildCommand(options: BuildExecutorSchema) {
  try {
    if (options.envFile) {
      const envConfig = dotenv.config({path: path.resolve(__dirname, options.envFile)})

      if (envConfig.error) {
        logger.warn(`Error reading .env file: ${envConfig.error}`);
      } else if (envConfig.parsed) {
        for (const key of Object.keys(envConfig.parsed)) {
          process.env[key] = envConfig.parsed[key]
        }
      }
    }

    const buildArgs = ["build"];
    if (options.typescriptSupport) {
      buildArgs.push("--dir", `dist/${options.meshYmlPath}`);
    } else {
      buildArgs.push("--dir", `${options.meshYmlPath}`);
    }

    if (options.fileType) {
      buildArgs.push("--fileType", `${options.fileType}`);
    }

    await graphqlMesh({...DEFAULT_CLI_PARAMS}, buildArgs)
  } catch (e) {
    return {
      success: false
    }
  }

  // copy files in order to use in unit tests.
  copyFilesRecursiveSync(`dist/${options.meshYmlPath}`, `${options.rootPath}/.compiled`)

  return {
    success: true,
  };
}

function removeLastOnPath(fullPath: string) {
  const splitted = fullPath.split("/")
  if (splitted.length) {
    splitted.pop();
    fullPath = splitted.join("/")
  }
  return fullPath;
}

function constructMeshRcYamlFile(meshYmlPath: string, packageManagerCommands: PackageManagerCommands) {
  const packageManager = detectPackageManager();
  const baseCommand = `yamlinc --output ./dist/${meshYmlPath}/.meshrc.yml ./${meshYmlPath}/.meshrc.yml --strict`
  let yamLincCommand = ""

  if (packageManager === "npm") {
    yamLincCommand = `${packageManagerCommands.exec} --package=yamlinc -c '${baseCommand}'`
  } else {
    yamLincCommand = `${packageManager} dlx ${baseCommand}`
  }

  try {
    logger.info(` > ${yamLincCommand}`)
    execSync(yamLincCommand, {stdio: [0, 1, 2]})
  } catch (e) {
    logger.error(`Failed to execute command: ${yamLincCommand}`);

    return {
      success: false
    }
  }
}

async function transpileTypescriptFiles(options: BuildExecutorSchema) {
  await tsc.compile({'project': `./${options.tsconfigPath}`})
  await replaceTscAliasPaths({configFile: options.tsconfigPath})
}

function copyFilesRecursiveSync(src: string, dest: string) {
  const exists: boolean = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!existsSync(dest)) {
      mkdirSync(dest);
    }
    readdirSync(src).forEach((childItemName: string) => {
      copyFilesRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    copyFileSync(src, dest);
  }
}

function copyNonJavascriptFilesRecursiveSync(src: string, dest: string, rootDir: string) {
  const exists: boolean = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!existsSync(dest)) {
      mkdirSync(dest);
    }
    readdirSync(src).forEach((childItemName: string) => {
      copyNonJavascriptFilesRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName), rootDir);
    });
  } else {
    // eslint-disable-next-line
    const isJavascriptOrMeshRcFile = src.match("(.*(\.ts|\.js)|\.meshrc\.yml)$");
    const fileOnRootFolder = removeLastOnPath(src) === rootDir;

    if (!isJavascriptOrMeshRcFile && !fileOnRootFolder) {
      copyFileSync(src, dest);
    }
  }
}
