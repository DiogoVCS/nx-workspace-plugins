import {
  addDependenciesToPackageJson,
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
}

function normalizeOptions(
  tree: Tree,
  options: StrykerMutatorGeneratorSchema
): NormalizedSchema[] {

  const projects = getProjects(tree);
  const normalizedSchemas: NormalizedSchema[] = [];

  options.name.split(',').forEach(projectName => {
    let projectRoot = projects.get(projectName)?.root
    if (!projectRoot) {

      const sourceRoot = projects.get(projectName)?.sourceRoot
      if (!sourceRoot) {
        logger.error(`Could not generate files for project ${projectName}`);
      }
      projectRoot = `${sourceRoot?.replace(new RegExp("/src$", ""), '')}`;
    }


    normalizedSchemas.push({
      ...options,
      projectName,
      projectRoot
    });

  });

  return normalizedSchemas;
}

function addFiles(tree: Tree, options: NormalizedSchema) {

  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, './files'),
    options.projectRoot,
    templateOptions
  );
}

function addMissingDependencies(tree: Tree, options: NormalizedSchema) {
  const dependencies: Record<string, string> = {}

  let devDependencies: Record<string, string> = {
    "@stryker-mutator/core": "^6.2.3",
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
            strykerConfig: `${normalizedOption.projectRoot}/src/stryker.config.js`,
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
