import {
  addDependenciesToPackageJson,
  detectPackageManager,
  formatFiles,
  generateFiles,
  getProjects,
  logger,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import * as path from 'path';
import {StrykerMutatorGeneratorSchema} from './schema';

interface NormalizedSchema extends StrykerMutatorGeneratorSchema {
  projectName: string;
  projectRoot: string;
  sourceRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: StrykerMutatorGeneratorSchema
): NormalizedSchema[] {

  const projects = getProjects(tree);
  const normalizedSchemas: NormalizedSchema[] = [];

  options.names.split(',').forEach(projectName => {
    let projectRoot = projects.get(projectName)?.root
    const sourceRoot = projects.get(projectName)?.sourceRoot

    if (!projectRoot) {
      if (!sourceRoot) {
        logger.error(`Could not generate files for project ${projectName}`);
      }
      projectRoot = `${sourceRoot?.replace(new RegExp("/src$", ""), '')}`;
    }


    normalizedSchemas.push({
      ...options,
      projectName,
      projectRoot,
      sourceRoot
    });

  });

  return normalizedSchemas;
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  let filesPath = './files_node';

  if (options.preset === 'angular') {
    filesPath = './files_angular';
  } else if (options.preset === 'react') {
    filesPath = './files_react';
  } else if (options.preset === 'nestjs') {
    filesPath = './files_nestjs';
  }

  const templateOptions = {
    ...options,
    ...names(options.names),
    packageManager: detectPackageManager(),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, filesPath),
    options.projectRoot,
    templateOptions
  );
}

function addMissingDependencies(tree: Tree, options: NormalizedSchema) {
  const dependencies: Record<string, string> = {}

  let devDependencies: Record<string, string> = {
    "@stryker-mutator/core": "^6.3.0",
    "@stryker-mutator/html-reporter": "^3.1.0",
    "@stryker-mutator/jest-runner": "^6.3.0",
  }

  return addDependenciesToPackageJson(tree, dependencies, devDependencies)
}


export default async function (
  tree: Tree,
  options: StrykerMutatorGeneratorSchema
) {
  const normalizedOptions: NormalizedSchema[] = normalizeOptions(tree, options);

  const installTask = addMissingDependencies(tree, normalizedOptions[0]);

  normalizedOptions.forEach(normalizedOption => {
    const project = readProjectConfiguration(tree, normalizedOption.projectName)

    updateProjectConfiguration(tree, normalizedOption.projectName, {
      ...project,
      targets: {
        ...project.targets,
        mutate: {
          executor: '@diogovcs/stryker-mutator:mutate',
          options: {
            strykerConfig: `${normalizedOption.projectRoot}/stryker.config.js`,

          },
        },
      }
    })

    addFiles(tree, normalizedOption);
  })

  await formatFiles(tree);

  return () => {
    installTask();
  };
}
