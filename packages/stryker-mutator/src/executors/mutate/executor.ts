import {ExecutorContext, logger} from "@nrwl/devkit";
import {Stryker} from '@stryker-mutator/core';
import * as path from "path";
import {MutateExecutorSchema} from "./schema";

process.env.NODE_ENV ??= 'test';

export async function strykerExecutor(
  options: MutateExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {

  logger.warn("Reading stryker configuration.")

  const strykerConfig = await import(path.resolve(context.root, options.strykerConfig));

  logger.warn(`Reading stryker configuration. ${strykerConfig}`)

  // const strykerConfigFileContent = readFileSync(options.strykerConfig, {encoding: 'utf-8'})
  // logger.warn(`Reading stryker configuration getting file content. ${strykerConfigFileContent}`)
  // const strykerConfigAst = tsquery.ast(strykerConfigFileContent);
  // logger.warn("Reading stryker configuration getting file content. 2")
  // const strykerConfig = tsquery(strykerConfigAst, 'ObjectLiteralExpression')[0] as unknown as ObjectType;

  // logger.warn(`Stryker RAN - ${strykerConfig['testRunner']}`)

  const stryker = new Stryker({...strykerConfig});

  try {
    const mutantResults = await stryker.runMutationTest();
    logger.log(mutantResults);

  } catch (error) {
    logger.error("Stryker was unable to run the mutation test. " + error);

    return {
      success: false
    }
  }

  return {
    success: true,
  };
}

export default strykerExecutor;
