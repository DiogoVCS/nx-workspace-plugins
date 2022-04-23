export type FileTypeSchema = "json" | "ts"

export interface BuildExecutorSchema {
  meshYmlPath: string;
  fileType?: FileTypeSchema;
  envFile?: string;
}
