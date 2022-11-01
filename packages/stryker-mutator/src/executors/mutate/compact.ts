import {convertNxExecutor} from '@nrwl/devkit';

import {default as strykerExecutor} from './executor';

export default convertNxExecutor(strykerExecutor);
