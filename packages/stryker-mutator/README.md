# NX Stryker Mutator

[Nx](https://nx.dev) plugin for [Stryker Mutator](https://stryker-mutator.io) integration within a Nx Workspace.

## Setup

### Npm

```shell
npm install -D @diogovcs/stryker-mutator
```

### Yarn

```shell
yarn add -D @diogovcs/stryker-mutator
```

### Pnpm

```shell
pnpm add -D @diogovcs/stryker-mutator
```

### Add to Workspace

```shell
nx generate @diogovcs/stryker-mutator:stryker-mutator [APPS_NAME] [...OPTIONS]
```

This command will generate stryker configuration for the projects. This plugin have presets set for node, nestjs and
Angular applications.
The available options allowed when generating an application are the following:

| name      | type                        | default | description                                                                |
|-----------|-----------------------------|---------|----------------------------------------------------------------------------|
| APPS_NAME | `string`                    | -       | Runs stryker for the projects. Accepts a comma separated list of projects. |
| --preset  | `angular OR node OR nestjs` | -       | Sets different project configurations depending on the preset chosen.      |

### Examples

Generate stryker configurations for multiple projects:

```shell
nx generate @diogovcs/stryker-mutator:stryker-mutator my-first-project,my-second-project
```

## Mutate

The Mutate executor can take optional parameters as the location of the stryker configuration file.
Here it is an example a mutate executor configuration:

```json
{
  "mutate": {
    "executor": "@diogovcs/stryker-mutator:mutate",
    "options": {
      "strykerConfig": "apps/my-app/stryker.config.js"
    }
  }
}
```

### Options

| name          | type      | default | description                                                                                                          |
|---------------|-----------|---------|----------------------------------------------------------------------------------------------------------------------|
| mutate        | `string`  | -       | Specific pattern or file to mutate. (example: `src/app.js` or `src/app.js:5-7`).                                     |
| strykerConfig | `string`  | -       | Path to the stryker.config.js file.                                                                                  |
| incremental   | `boolean` | `false` | StrykerJS will track the changes you make to your code and tests and only runs mutation testing on the changed code. |
