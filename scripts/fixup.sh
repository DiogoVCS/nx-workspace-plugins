#!/bin/sh

cp packages/stryker-mutator/package.json dist/packages/stryker-mutator

cat >dist/packages/stryker-mutator/dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >dist/packages/stryker-mutator/dist/mjs/package.json <<!EOF
{
    "type": "module"
}
!EOF
