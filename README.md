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
     * [asLocalTime](#aslocaltime-)
     * [asUTC](#asutc-)
     * [buildWorkflow](#buildworkflow-)
     * [cloneObject](#cloneobject-)
     * [compareValues](#comparevalues-)
     * [compareValuesBy](#comparevaluesny-)
     * [createCompletedAction](#createcompletedaction-)
     * [createLogger](#createlogger-)
     * [forEachAsync](#foreachasync-)
     * [format](#format-)
     * [formatArray](#formatarray-)
     * [from](#from-)
     * [glob](#glob-)
     * [invokeAfter](#invokeafter-)
     * [normalizeString](#normalizestring-)
     * [randomBytes](#randombytes-)
     * [registerWorkspaceWatcher](#registerworkspacewatcher-)
     * [sleep](#sleep-)
     * [toArray](#toarray-)
     * [toBooleanSafe](#tobooleansafe-)
     * [toEOL](#toeol-)
     * [toStringSafe](#tostringsafe-)
     * [tryClearInterval](#tryclearinterval-)
     * [tryClearTimeout](#trycleartimeout-)
     * [tryDispose](#trydispose-)
     * [waitWhile](#waitwhile-)
     * [withProgress](#withprogress-)
   * [Classes](#classes-)
     * [DisposableBase](#disposablebase-)
     * [WorkspaceBase](#workspacebase-)
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

### Functions [[&uarr;](#examples-)]

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

#### asLocalTime [[&uarr;](#functions-)]

```typescript
import * as Moment from 'moment';

let utcNow = Moment.utc();
let localNow = vscode_helpers.asLocalTime( utcNow );  // can also be a string
                                                      // or Date object
```

#### asUTC [[&uarr;](#functions-)]

```typescript
import * as Moment from 'moment';

let localNow = Moment();
let utcNow = vscode_helpers.asUTC( localNow );  // can also be a string
                                                // or Date object
```

#### buildWorkflow [[&uarr;](#functions-)]

```typescript
const WORKFLOW = vscode_helpers.buildWorkflow()
    .next((prevValue) => {
              return 5979;
          })
    .next((prevValue, context) => {
              context.value = 1000;

              return prevValue + 23979;
          })
    .next((prevValue, context) => {
              return prevValue * context.value;
          });

WORKFLOW.start().then((result) => {
    // result === 29958
}, (err) => {
    // this only happens on errors
});
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

#### createLogger [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const LOGGER = vscode_helpers.createLogger((log) => {
    fs.appendFileSync('./logFile.txt', log.message + "\r\n", 'utf8');
});

LOGGER.info('Hello, LOG!');
```

#### forEachAsync [[&uarr;](#functions-)]

```typescript
vscode_helpers.forEachAsync([ 5979, 23979 ], async (item, index) => {
    // [index === 0] => item === 5979
    // [index === 1] => item === 23979

    return item * 1000;
}).then((lastResult) => {
    // lastResult === 23979000
}, (err) => {
    // error
});
```

#### format [[&uarr;](#functions-)]

```typescript
// "MK:23979 + TM: '5979'"
let str_1 = vscode_helpers.format(
    'MK:{1} + TM:{1:trim,surround,leading_space}',
    5979,
    23979
);
```

#### formatArray [[&uarr;](#functions-)]

```typescript
// "MK:23979 + TM: '5979'"
let str_1 = vscode_helpers.formatArray(
    'MK:{1} + TM:{1:trim,surround,leading_space}',
    [ 5979, 23979 ]
);
```

#### from [[&uarr;](#functions-)]

s. [node-enumerable](https://github.com/mkloubert/node-enumerable)

```typescript
let seq = vscode_helpers.from([ 1, 2, 3 ])  // can also be a generator
                                            // or string
                        .select(x => '' + x)
                        .where(x => x !== '2');

for (const ITEM of seq) {
    // [0] '1'
    // [1] '3'
}
```

#### glob [[&uarr;](#functions-)]

```typescript
vscode_helpers.glob([ '**/*.txt' ], {
    cwd: '/path/to/directory',
    ignore: [ '/log/**/*' ],
    root: '/path/to/directory',
}).then((matches: string) => {
    // 'matches' contains the found files
}, (err) => {
    // error
});
```

#### invokeAfter [[&uarr;](#functions-)]

```typescript
vscode_helpers.invokeAfter(() => {
    // this is invoked after 5979 milliseconds
    return 23979;
}, 5979).then((res) => {
    // res === 23979
}, (err) => {
    // is invoked on error
});
```

#### normalizeString [[&uarr;](#functions-)]

```typescript
const str_1 = vscode_helpers.normalizeString('aBc');  // 'abc'
const str_2 = vscode_helpers.normalizeString(null);  // ''
const str_3 = vscode_helpers.normalizeString('aBc', s => s.troUpperCase());  // 'ABC'
```

#### randomBytes [[&uarr;](#functions-)]

```typescript
vscode_helpers.randomBytes(5979).then((bytes) => {
    // 5979 random bytes are stored
    // in 'bytes' now
}, (err) => {
    // error
});
```

#### registerWorkspaceWatcher [[&uarr;](#functions-)]

```typescript
import { Uri } as vscode from 'vscode';

class MyWorkspace extends vscode_helpers.WorkspaceBase {
    // this is important for 'onDidChangeConfiguration'
    public get configSource() {
        return {
            section: 'my.extension',
            resource: Uri.file('/path/to/.vscode/settings.json'),
        };
    }    

    public async initialize() {
        // initialize your workspace here
    }

    public async onDidChangeConfiguration(e) {
        // is invoked when workspace config changed
    }
}

vscode_helpers.registerWorkspaceWatcher((event, folder, workspace?) => {
    switch (event) {
        case vscode_helpers.WorkspaceWatcherEvent.Added:            
            const NEW_WORKSPACE = new MyWorkspace( folder );
            {
                await NEW_WORKSPACE.initialize();
            }
            return NEW_WORKSPACE;
    }
});
```

#### sleep [[&uarr;](#functions-)]

```typescript
vscode_helpers.sleep(23979).then(() => {
    // 23979 milliseconds gone
}, (err) => {
    // is invoked on error
});
```

#### toBooleanSafe [[&uarr;](#functions-)]

```typescript
const bool_1 = vscode_helpers.toBooleanSafe( true );  // (true)
const bool_2 = vscode_helpers.toBooleanSafe( null );  // (false)
const bool_3 = vscode_helpers.toBooleanSafe( undefined, true );  // (true)
```

#### toArray [[&uarr;](#functions-)]

```typescript
let myGenerator = function* () {
    yield 5979;
    yield 23979;
};

let arr_1 = vscode_helpers.toArray( myGenerator() );
let arr_2 = vscode_helpers.toArray( [ 19861222, 'PZSUX' ] );  // new array
```

#### toEOL [[&uarr;](#functions-)]

```typescript
import { EndOfLine } as vscode from 'vscode';

const eol_1 = vscode_helpers.toEOL();  // system's EOL
const eol_2 = vscode_helpers.toEOL( EndOfLine.CRLF );  // \r\n
```

#### tryClearInterval [[&uarr;](#functions-)]

```typescript
let timer = setInterval(() => {
    // do something
}, 5979);

vscode_helpers.tryClearInterval( timer );
```

#### tryClearTimeout [[&uarr;](#functions-)]

```typescript
let timer = setTimeout(() => {
    // do something
}, 23979);

vscode_helpers.tryClearTimeout( timer );
```

#### tryDispose [[&uarr;](#functions-)]

```typescript
const OBJ = {
    dispose: () => {
        throw new Error( 'Could not dispose!' );
    }
};

// (false)
vscode_helpers.tryDispose( OBJ );
```

#### toStringSafe [[&uarr;](#functions-)]

```typescript
const str_1 = vscode_helpers.toStringSafe( 123 );  // '123'
const str_2 = vscode_helpers.toStringSafe( null );  // ''
const str_3 = vscode_helpers.toStringSafe( undefined, 'abc' );  // 'abc'
```

#### waitWhile [[&uarr;](#functions-)]

```typescript
let counter = 5979;

vscode_helpers.waitWhile(() => {
    return --counter < 1;
}, {
    timeUntilNextCheck: 100,
    timeout: 60000,
}).then((isTimeout: boolean) => {
    // counter === 0
}, (err) => {
    // error occurred
});
```

#### withProgress [[&uarr;](#functions-)]

```typescript
import { ProgressLocation } as vscode from 'vscode';

vscode_helpers.withProgress((context) => {
    let res = 0;

    for (let i = 0; i < 10; i++) {
        context.message = `Task ${i + 1} of 10 ...`;

        // do something

        ++res;
    }

    return res;
}, {
    location: ProgressLocation.Window,
    title: 'My operation',
}).then((res) => {
    // res === 10
}, (err) => {
    // error
});
```

### Classes [[&uarr;](#examples-)]

#### DisposableBase [[&uarr;](#classes-)]

```typescript
class MyDisposable extends vscode_helpers.MyDisposable {
    protected onDispose() {
        // your custom logic
    }
}

vscode_helpers.tryDispose( new MyDisposable() );
```

#### WorkspaceBase [[&uarr;](#classes-)]

```typescript
import { Uri } as vscode from 'vscode';

class MyWorkspace extends vscode_helpers.WorkspaceBase {
    // this is important for 'onDidChangeConfiguration'
    public get configSource() {
        return {
            section: 'my.extension',
            resource: Uri.file('/path/to/.vscode/settings.json'),
        };
    }    

    public async initialize() {
        // initialize your workspace here
    }

    public async onDidChangeConfiguration(e) {
        // is invoked when workspace config changed
    }

    protected onDispose(): void {
        // put code here to cleanup the workspace
    }
}
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
