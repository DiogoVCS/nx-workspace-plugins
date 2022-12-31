import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  convertNxGenerator,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
  updateJson
} from '@nrwl/devkit';
import * as path from 'path';
import {GraphqlMeshGeneratorSchema} from './schema';

interface NormalizedSchema extends GraphqlMeshGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: GraphqlMeshGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema, dir: string) {
  let projectName = options.projectName;

  if (options.directory) {
    projectName = `${options.directory.replace("/", "-")}-${options.projectName}`
  }


  const templateOptions = {
    ...options,
    ...names(options.name),
    projectName,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    singleMeshFile: options.singleMeshFile,
    template: '',
  };


  generateFiles(
    tree,
    path.join(__dirname, dir),
    options.projectRoot,
    templateOptions
  );
}

function addMissingDependencies(tree: Tree, options: NormalizedSchema) {
  const dependencies: Record<string, string> = {
    "@graphql-mesh/cli": "0.82.7",
    "@graphql-mesh/json-schema": "0.37.5",
    "@graphql-mesh/transform-mock": "0.15.6",
    "@graphql-mesh/transform-naming-convention": "0.13.5",
    "graphql": "16.6.1",
  }

  let devDependencies: Record<string, string> = {
    "@graphql-mesh/cross-helpers": "0.1.0",
    "@graphql-mesh/plugin-mock": "^0.1.4",
    "ts-node-dev": "^2.0.0",
    "module-alias": "^2.2.2",
  }

  if (!options.singleMeshFile) {
    devDependencies = {...devDependencies, "yamlinc": "0.1.10"}
  }

  return addDependenciesToPackageJson(tree, dependencies, devDependencies)
}

function addJestPreset(tree: Tree, options: NormalizedSchema) {
  generateFiles(
    tree,
    path.join(__dirname, './files-root'),
    `${offsetFromRoot(options.projectDirectory)}/proj`,
    {}
  );
}

export async function applicationGenerator(
  tree: Tree,
  options: GraphqlMeshGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const installTask = addMissingDependencies(tree, normalizedOptions);

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@diogovcs/graphql-mesh:build',
        options: {
          meshYmlPath: `${normalizedOptions.projectRoot}/config`,
          singleMeshFile: options.singleMeshFile,
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          rootPath: `${normalizedOptions.projectRoot}`,
          tsconfigPath: `${normalizedOptions.projectRoot}/tsconfig.app.json`,
          typescriptSupport: true
        }
      },
      test: {
        executor: "@nrwl/jest:jest",
        dependsOn: [
          {target: "build", projects: "self"}
        ],
        outputs: [`coverage/${normalizedOptions.projectRoot}`],
        options: {
          jestConfig: `${normalizedOptions.projectRoot}/jest.config.ts`,
          passWithNoTests: true
        }
      },
      serve: {
        executor: '@diogovcs/graphql-mesh:serve',
        dependsOn: [
          {
            target: "build",
            projects: "self"
          }
        ],
        options: {
          meshYmlPath: `${normalizedOptions.projectRoot}/config`,
          tsConfigPath: `${normalizedOptions.projectRoot}/tsconfig.app.json`,
          rootPath: `${normalizedOptions.projectRoot}`,
          mainPath: `${normalizedOptions.projectRoot}/src/main.ts`,
        }
      },
      start: {
        executor: "@diogovcs/graphql-mesh:start",
        dependsOn: [
          {
            target: "build",
            projects: "self"
          }
        ],
        options: {
          meshYmlPath: `${normalizedOptions.projectRoot}/config`,
          typescriptSupport: true
        }
      },
      lint: {
        executor: "@nrwl/linter:eslint",
        options: {
          lintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.ts`]
        }
      }
    },
    tags: normalizedOptions.parsedTags,
  });

  addJestPreset(tree, normalizedOptions)

  addFiles(tree, normalizedOptions, './files');

  if (!options.singleMeshFile) {
    addFiles(tree, normalizedOptions, './files-multiple-mesh');
  }

  updateJson(tree, "package.json", (value) => {
    if (value?.scripts) {
      value.scripts = {
        ...value.scripts,
        "ts-node-dev": "ts-node-dev",
      }
    }
    return value;
  })

  await formatFiles(tree);

  return () => {
    installTask();
  };
}

export default applicationGenerator;
export const applicationSchematic = convertNxGenerator(applicationGenerator);
