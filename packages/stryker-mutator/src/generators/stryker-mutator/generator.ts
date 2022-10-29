import {
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
  const normalizedSchemas = [];

  options.name.split(',').forEach(projectName => {
    let projectRoot = projects.get(projectName).root
    if (!projectRoot) {

      const sourceRoot = projects.get(projectName).sourceRoot
      if (!sourceRoot) {
        logger.error(`Could not generate files for project ${projectName}`);
      }
      projectRoot = `${sourceRoot.replace(new RegExp("/src$", ""), '')}`;
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
  logger.error(`GOT HERE 5 ${options.projectRoot}`);


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

export default async function (
  tree: Tree,
  options: StrykerMutatorGeneratorSchema
) {
  logger.error(`GOT HERE`);

  const normalizedOptions: NormalizedSchema | NormalizedSchema[] = normalizeOptions(tree, options);

  logger.error(normalizedOptions);

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
    logger.error(`GOT HERE 3`);
    addFiles(tree, normalizedOption);
  })

  await formatFiles(tree);
}
