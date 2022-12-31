import {ProjectConfiguration} from "nx/src/config/workspace-json-project-json";
import {getProjects} from "nx/src/generators/utils/project-configuration";
import {Tree} from "@nrwl/devkit";

export function getGraphqlMeshProjects(tree: Tree) {
  const projects = getProjects(tree);
  const filtered = new Map<string, ProjectConfiguration>();
  projects.forEach((value: ProjectConfiguration, key: string) => {
    if (isGraphqlMeshProject(value)) {
      filtered.set(key, value);
    }
  });

  return filtered;
}

export function isGraphqlMeshProject(project: any): boolean {
  return ['build', 'serve', 'start']
    .map((command: string) => {
      const target =
        project.targets && project.targets[command]
          ? project.targets[command]
          : {};
      return (target && target.executor === `@diogovcs/graphql-mesh:${command}`);
    })
    .some((value: boolean) => value === true);
}
