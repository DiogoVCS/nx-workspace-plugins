import {
  formatFiles,
  getProjects,
  logger,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration
} from '@nrwl/devkit';
import {join} from 'path';

export default async function update(host: Tree) {
  const projects = getProjects(host);

  for (let [name, project] of projects) {
    const tsConfigPath = join(project.root, 'tsconfig.spec.ts');
    const strykerConfigPath = join(project.root, 'stryker.config.js');

    if (!host.exists(strykerConfigPath)) {
      return;
    }

    const strykerConfig = await import(strykerConfigPath)
    strykerConfig["jest"]["configFile"] = join(project.root, 'stryker.config.js')

    host.delete(strykerConfigPath);

    host.write(join(project.root, 'stryker.config.js'), `module.exports = ${strykerConfig}`);

    const projectConfig: ProjectConfiguration = readProjectConfiguration(host, name);

    if (projectConfig.targets["mutate"]) {
      projectConfig.targets["mutate"].options = {
        ...projectConfig.targets["mutate"].options,
        tsConfig: tsConfigPath
      };

      updateProjectConfiguration(host, name, {
        ...projectConfig
      })

    } else {
      logger.info(`Skipping stryker mutation config for project ${name} because it did not found mutate target.`)
    }
  }

  await formatFiles(host);
}
