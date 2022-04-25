# NX Graphql Mesh

[Nx](https://nx.dev) plugin for [GraphQL Mesh](https://www.graphql-mesh.com) integration within a Nx Workspace.

## Setup

### Npm

```shell
npm install -D @diogovcs/graphql-mesh
```

### Yarn

```shell
yarn add -D @diogovcs/graphql-mesh
```

### Pnpm

```shell
pnpm add -D @diogovcs/graphql-mesh
```

### Add to Workspace

```shell
nx generate @diogovcs/graphql-mesh:install [APP_NAME] [...OPTIONS]
```

This command will create a graphql mesh application with the name APP_NAME for the provided options. By default, this
will create a `.meshrc.yml` file that is separated into multiple yaml files. This uses the `yamlinc` project to merge all
the different configurations before build the application (this configuration can be overridden in the options). The
available options allowed when generating an application are the following:

| name             | type      | default | description                                                  |
|------------------|-----------|---------|--------------------------------------------------------------|
| --dryRun         | `boolean` | `false` | run with dry mode                                            |
| --singleMeshFile | `boolean` | `false` | Creates a project with a single `.meshrc` configuration file |
| --dir            | `string`  | `apps`  | Directory where the application will be created at.          |

### Examples

Run with single mesh configuration:

```shell
nx generate @diogovcs/graphql-mesh:install my-graphql-mesh --singleMeshFile
```

Create app on specif folder:

```shell
nx generate @diogovcs/graphql-mesh:install my-graphql-mesh --directory=apps/api-gateways
```

## Build

The build executor can take optional parameters as the location of the main `.meshrc.yml` folder and a boolean flagging
if the build should use the `yamlinc` to build the full `.mesrc.yml` configuration or not.

Here it is an example a build executor configuration:

```json
{
  "build": {
    "executor": "@diogovcs/graphql-mesh:build",
    "options": {
      "meshYmlPath": "apps/api-gateway/config",
      "singleMeshFile": false
    }
  }
}
```

When using the `singleMeshFile` configuration with `false`, the compiled `.meshrc.yml` will be created under
the `.compiled` folder.
