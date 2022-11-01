import {MutateExecutorSchema} from './schema';
import {logger} from "@nrwl/devkit";
import {Stryker} from '@stryker-mutator/core';
import {readFileSync} from "fs";
import {tsquery} from "@phenomnomnominal/tsquery";
import type {ObjectType} from 'typescript';

process.env.NODE_ENV ??= 'test';

export default async function runExecutor(options: MutateExecutorSchema) {

  logger.warn("Reading stryker configuration.")

  const strykerConfigFileContent = readFileSync(options.strykerConfig, {encoding: 'utf-8'})
  logger.warn(`Reading stryker configuration getting file content. ${strykerConfigFileContent}`)
  const strykerConfigAst = tsquery.ast(strykerConfigFileContent);
  logger.warn("Reading stryker configuration getting file content. 2")
  const strykerConfig = tsquery(strykerConfigAst, 'ObjectLiteralExpression')[0] as unknown as ObjectType;

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
