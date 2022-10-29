import {MutateExecutorSchema} from './schema';
import {logger,} from "@nrwl/devkit";
import {Stryker} from '@stryker-mutator/core';

export default async function runExecutor(options: MutateExecutorSchema) {
  // const mutateCommand = createMutateCommand(options);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const strykerConfig = require(options.strykerConfig)

  // Runs Stryker, will not assume to be allowed to exit the process.
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
