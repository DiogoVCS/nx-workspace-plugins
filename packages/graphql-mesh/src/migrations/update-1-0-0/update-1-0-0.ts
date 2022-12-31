import {
  addDependenciesToPackageJson,
  generateFiles,
  logger,
  names,
  offsetFromRoot, removeDependenciesFromPackageJson,
  Tree,
  updateProjectConfiguration
} from "@nrwl/devkit";
import {getGraphqlMeshProjects} from "../utils/migration-utils";
import {ProjectConfiguration} from "nx/src/config/workspace-json-project-json";
import {deleteFile, renameSync, updatePackagesInPackageJson} from "@nrwl/workspace";
import * as path from "path";

function updateServeTarget(projectConfiguration: ProjectConfiguration) {
  projectConfiguration.targets["serve"] = {
    ...projectConfiguration.targets["serve"],
    dependsOn: [
      ...projectConfiguration.targets["serve"].dependsOn,
      {
        target: "build",
        projects: "self"
      }
    ],
    options: {
      ...projectConfiguration.targets["serve"].options,
      tsConfigPath: `${projectConfiguration.root}/tsconfig.app.json`,
      rootPath: `${projectConfiguration.root}`,
      mainPath: `${projectConfiguration.root}/src/main.ts`,
    }
  }
}

function updateBuildTarget(projectConfiguration: ProjectConfiguration) {
  projectConfiguration.targets["build"] = {
    ...projectConfiguration.targets["build"],
    options: {
      ...projectConfiguration.targets["build"].options,
      tsconfigPath: `${projectConfiguration.root}/tsconfig.app.json`,
    }
  }
}

function addStartTarget(projectConfiguration: ProjectConfiguration) {
  projectConfiguration.targets["start"] = {
    executor: "@diogovcs/graphql-mesh:start",
    dependsOn: [
      {
        target: "build",
        projects: "self"
      }
    ],
    options: {
      meshYmlPath: `${projectConfiguration.root}/config`,
      typescriptSupport: true
    }
  }
}

function updateTestTarget(projectConfiguration: ProjectConfiguration) {
  const previousJestConfig = projectConfiguration.targets["test"]?.options?.jestConfig;

  const jestConfig = previousJestConfig ? previousJestConfig.replace("jest.config.js", "jest.config.ts") : `${projectConfiguration.root}/jest.config.ts`;

  if (projectConfiguration.targets["test"]) {
    projectConfiguration.targets["test"] = {
      ...projectConfiguration.targets["test"],
      options: {
        ...projectConfiguration.targets["test"].options,
        jestConfig
      }
    }
  }
}

export default function update(host: Tree) {
  const graphqlMeshProjects = getGraphqlMeshProjects(host);

  graphqlMeshProjects.forEach((projectConfiguration: ProjectConfiguration, appName: string) => {

      if (projectConfiguration.projectType === 'application') {
        if (projectConfiguration.targets["serve"]) {
          updateServeTarget(projectConfiguration);
          addStartTarget(projectConfiguration);
          updateBuildTarget(projectConfiguration);
          updateTestTarget(projectConfiguration);

          updateProjectConfiguration(host, appName, projectConfiguration);

          addDependenciesToPackageJson(host, {},
            {
              "@graphql-mesh/plugin-mock": "^0.1.4",
              "ts-node-dev": "^2.0.0",
              "module-alias": "^2.2.2",
            });

          removeDependenciesFromPackageJson(host, [], ["@babel/preset-env", "@babel/preset-typescript"])

          updatePackagesInPackageJson(
            path.join(__dirname, '../../../', 'migrations.json'),
            '1.0.0'
          );

          renameSync(`${projectConfiguration.root}/tsconfig.lib.json`,
            `${projectConfiguration.root}/tsconfig.app.json`, (error: Error | null) => {
              logger.warn("Error renaming tsconfig.lib.json to tsconfig.app.json")
            })

          renameSync(`${projectConfiguration.root}/jest.config.js`, `${projectConfiguration.root}/jest.config.ts`, (error: Error | null) => {
            logger.warn("Error renaming jest.config.js to jest.config.ts")
          })

          deleteFile(`${projectConfiguration.root}/babel-jest.config.json`)

          generateSrcFiles(host, projectConfiguration);

          generateRootFiles(host, projectConfiguration)
        }
      }
    }
  );
}

function generateRootFiles(host: Tree, projectConfiguration: ProjectConfiguration) {

  const templateOptions = {
    ...names(projectConfiguration.name),
    projectRoot: projectConfiguration.root,
    projectName: projectConfiguration.name,
    offsetFromRoot: offsetFromRoot(projectConfiguration.root),
  };

  generateFiles(
    host,
    path.join(__dirname, "./templates/root"),
    projectConfiguration.root,
    templateOptions
  );
}

function generateSrcFiles(host: Tree, projectConfiguration: ProjectConfiguration) {

  const templateOptions = {
    ...names(projectConfiguration.name),
    projectRoot: projectConfiguration.root,
    projectName: projectConfiguration.name,
    offsetFromRoot: offsetFromRoot(projectConfiguration.root),
  };

  generateFiles(
    host,
    path.join(__dirname, "./templates/src"),
    projectConfiguration.sourceRoot,
    templateOptions
  );
}
