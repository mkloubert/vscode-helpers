[![npm](https://img.shields.io/npm/v/vscode-helpers.svg)](https://www.npmjs.com/package/vscode-helpers)
[![npm](https://img.shields.io/npm/dt/vscode-helpers.svg?label=npm%20downloads)](https://www.npmjs.com/package/vscode-helpers)

# vscode-helpers

Helper functions and classes for [Visual Studio Code extensions](https://code.visualstudio.com/docs/extensions/overview).

## Table of contents

1. [Install](#install-)
2. [Usage](#usage-)
3. [Examples](#examples-)
   * [Functions](#functions-)
     * [applyFuncFor](#applyfuncfor-)
     * [asArray](#asarray-)
     * [cloneObject](#cloneobject-)
     * [compareValues](#comparevalues-)
     * [compareValuesBy](#comparevaluesny-)
     * [createCompletedAction](#createcompletedaction-)
     * [toBooleanSafe](#tobooleansafe-)
     * [toEOL](#toeol-)
     * [toStringSafe](#tostringsafe-)
4. [Support and contribute](#support-and-contribute-)
5. [Documentation](#documentation-)

## Install [[&uarr;](#table-of-contents)]

From your project, run the following command:

```bash
npm install --save vscode-helpers
```

## Usage [[&uarr;](#table-of-contents)]

```typescript
// plain JavaScript
const vscode_helpers = require('vscode-helpers');

// the TypeScript way
import * as vscode_helpers from 'vscode-helpers';
```

## Examples [[&uarr;](#table-of-contents)]

### Functions [[&uarr;](#functions-)]

#### applyFuncFor [[&uarr;](#functions-)]

```typescript
const OBJ = { factor: 1000 };

function myTestFunc(a, b) {
    return (a + b) * this.factor;
}

const APPLIED_FUNC = vscode_helpers.applyFuncFor(
    myTestFunc, OBJ
);

APPLIED_FUNC(5979, 23979);  // 29958000
```

#### asArray [[&uarr;](#functions-)]

```typescript
const ARR_1 = vscode_helpers.asArray([ 0, 1, null, 3, 4, undefined ]);  // [ 0, 1, 3, 4 ]
const ARR_2 = vscode_helpers.asArray([ 0, 1, null, 3, 4, undefined ], false);  // [ 0, 1, null, 3, 4, undefined ]
const ARR_3 = vscode_helpers.asArray( 5979 );  // [ 5979 ]
const ARR_4 = vscode_helpers.asArray( null );  // [ ]
```

#### cloneObject [[&uarr;](#functions-)]

```typescript
const CLONED_OBJ = vscode_helpers.cloneObject({
    mk: 23979,
    tm: 5979,
});
```

#### compareValues [[&uarr;](#functions-)]

```typescript
const VAL_1 = 2;
const VAL_2 = 1;

const SORTED_OBJS = [ VAL_1, VAL_2 ].sort((x, y) => {
    return vscode_helpers.compareValues(x, y);
});
```

#### compareValuesBy [[&uarr;](#functions-)]

```typescript
const OBJ_1 = { sortValue: 2 };
const OBJ_2 = { sortValue: 1 };

const SORTED_OBJS = [ OBJ_1, OBJ_2 ].sort((x, y) => {
    return vscode_helpers.compareValuesBy(x, y,
                                          i => i.sortValue);
});
```

#### createCompletedAction [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

function loadMyFileAsync() {
    return new Promise<Buffer>(async (resolve, reject) => {
        const COMPLETED = vscode_helpers.createCompletedAction(resolve, reject);

        fs.readFile('./MyFile.txt', (err: NodeJS.ErrnoException, data: Buffer) => {
            COMPLETED(err, data);
        });
    });
}
```

#### toBooleanSafe [[&uarr;](#functions-)]

```typescript
const bool_1 = vscode_helpers.toBooleanSafe( true );  // (true)
const bool_2 = vscode_helpers.toBooleanSafe( null );  // (false)
const bool_3 = vscode_helpers.toBooleanSafe( undefined, true );  // (true)
```

#### toEOL [[&uarr;](#functions-)]

```typescript
import { EndOfLine } as vscode from 'vscode';

const eol_1 = vscode_helpers.toEOL();  // system's EOL
const eol_2 = vscode_helpers.toBooleanSafe( EndOfLine.CRLF );  // \r\n
```

#### toStringSafe [[&uarr;](#functions-)]

```typescript
const str_1 = vscode_helpers.toStringSafe( 123 );  // '123'
const str_2 = vscode_helpers.toStringSafe( null );  // ''
const str_3 = vscode_helpers.toStringSafe( undefined, 'abc' );  // 'abc'
```

## Support and contribute [[&uarr;](#table-of-contents)]

If you like the module, you can support the project by sending a [donation via PayPal](https://paypal.me/MarcelKloubert) to [me](https://github.com/mkloubert).

To contribute, you can [open an issue](https://github.com/mkloubert/vscode-helpers/issues) and/or fork this repository.

To work with the code:

* clone [this repository](https://github.com/mkloubert/vscode-helpers)
* create and change to a new branch, like `git checkout -b my_new_feature`
* run `npm install` from your project folder
* open that project folder in Visual Studio Code
* now you can edit and debug there
* commit your changes to your new branch and sync it with your forked GitHub repo
* make a [pull request](https://github.com/mkloubert/vscode-helpers/pulls)

## Documentation [[&uarr;](#table-of-contents)]

The API documentation can be found [here](https://mkloubert.github.io/vscode-helpers/).
