export type FileTypeSchema = "json" | "ts"

export interface BuildExecutorSchema {
  meshYmlPath: string;
  outputPath: string;
  rootPath: string;
  tsconfigPath: string
  typescriptSupport?: boolean;
  fileType?: FileTypeSchema;
  envFile?: string;
  singleMeshFile?: boolean;
}
