export interface ServeExecutorSchema {
  meshYmlPath: string;
  port?: number;
  envFile?: string;
  tsConfigPath: string;
  mainPath: string;
  rootPath: string;
}
