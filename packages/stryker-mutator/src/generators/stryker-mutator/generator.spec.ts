import {createTreeWithEmptyV1Workspace} from '@nrwl/devkit/testing';
import {readProjectConfiguration, Tree} from '@nrwl/devkit';

import generator from './generator';
import {StrykerMutatorGeneratorSchema} from './schema';

//FIXME: Fix and create more tests.
describe.skip('stryker-mutator generator', () => {
  let appTree: Tree;
  const options: StrykerMutatorGeneratorSchema = {names: 'test', preset: "angular"};

  beforeEach(() => {
    appTree = createTreeWithEmptyV1Workspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
