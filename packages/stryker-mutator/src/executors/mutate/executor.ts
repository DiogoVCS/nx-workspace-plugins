import {MutateExecutorSchema} from './schema';
import {logger,} from "@nrwl/devkit";
import {Stryker} from '@stryker-mutator/core';

export default async function runExecutor(options: MutateExecutorSchema) {
  // const mutateCommand = createMutateCommand(options);
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

  // const done = this.async();
  // const stryker = new Stryker({concurrency: 4});
  // stryker.runMutationTest().then(() => {
  //   let success = true;
  //
  //   if (process.exitCode > 0) {
  //     success = false;
  //   }
  //   done(success);
  // }, (error) => {
  //   grunt.fail.fatal("Stryker was unable to run the mutation test. " + error);
  // });


  // mutantResults or rejected with an error.

  return {
    success: true,
  };
}

// function createMutateCommand(options: MutateExecutorSchema) {
//   const stryker = options.version ? `stryker@${options.version}` : `stryker`;
//   const strykerGrep = options.version ? stryker : `stryker@`;
//
//   const result = execSync(`${getPackageManagerCommand().list} --location=global | grep ${strykerGrep}`)?.toString();
//
//   if (result === '') {
//     execSync(`${getPackageManagerCommand().addGlobal} ${stryker}`)
//   }
//
//
//   return `stryker run ${options.strykerConfig}`
// }
