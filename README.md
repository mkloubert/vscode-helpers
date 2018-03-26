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
     * [asBuffer](#asbuffer-)
     * [asLocalTime](#aslocaltime-)
     * [asUTC](#asutc-)
     * [buildWorkflow](#buildworkflow-)
     * [cloneObject](#cloneobject-)
     * [cloneObjectFlat](#cloneobjectflat-)
     * [compareValues](#comparevalues-)
     * [compareValuesBy](#comparevaluesby-)
     * [createCompletedAction](#createcompletedaction-)
     * [createDirectoryIfNeeded](#createdirectoryifneeded-)
     * [createLogger](#createlogger-)
     * [doesMatch](#doesmatch-)
     * [exists](#exists-)
     * [forEachAsync](#foreachasync-)
     * [format](#format-)
     * [formatArray](#formatarray-)
     * [from](#from-)
     * [fromMarkdown](#frommarkdown-)
     * [glob](#glob-)
     * [globSync](#globsync-)
     * [invokeAfter](#invokeafter-)
     * [isBinaryContent](#isbinarycontent-)
     * [isBinaryContentSync](#isbinarycontentsync-)
     * [isBlockDevice](#isblockdevice-)
     * [isBlockDeviceSync](#isblockdevicesync-)
     * [isCharacterDevice](#ischaracterdevice-)
     * [isCharacterDeviceSync](#ischaracterdevicesync-)
     * [isDirectory](#isdirectory-)
     * [isDirectorySync](#isdirectorysync-)
     * [isEmptyString](#isemptystring-)
     * [isFIFO](#isfifo-)
     * [isFIFOSync](#isfifosync-)
     * [isFile](#isfile-)
     * [isFileSync](#isfilesync-)
     * [isSocket](#issocket-)
     * [isSocketSync](#issocketsync-)
     * [isSymbolicLink](#issymboliclink-)
     * [isSymbolicLinkSync](#issymboliclinksync-)
     * [loadModule](#loadmodule-)
     * [makeNonDisposable](#makenondisposable-)
     * [normalizeString](#normalizestring-)
     * [randomBytes](#randombytes-)
     * [registerWorkspaceWatcher](#registerworkspacewatcher-)
     * [readAll](#readall-)
     * [sleep](#sleep-)
     * [toArray](#toarray-)
     * [toBooleanSafe](#tobooleansafe-)
     * [toEOL](#toeol-)
     * [toStringSafe](#tostringsafe-)
     * [tryClearInterval](#tryclearinterval-)
     * [tryClearTimeout](#trycleartimeout-)
     * [tryDispose](#trydispose-)
     * [tryRemoveListener](#tryremovelistener-)
     * [waitWhile](#waitwhile-)
     * [withProgress](#withprogress-)
   * [Classes](#classes-)
     * [CacheProviderBase](#cacheproviderbase-)
     * [DisposableBase](#disposablebase-)
     * [MemoryCache](#memorycache-)
     * [WorkspaceBase](#workspacebase-)
   * [Constants and variables](#constants-and-variables-)
     * [EVENTS](#events-)
     * [SESSION](#session-)
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

#### asBuffer [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const STREAM = fs.createReadStream('./my-file.txt');

asBuffer( STREAM ).then((data: Buffer) => {
    // all data read
}, (err) => {
    // error
});
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
    .next((prevValue: undefined, context: vscode_helpers.WorkflowActionContext) => {
              context.value = 1000;

              return 5979;
          })
    .next((prevValue: number, context: vscode_helpers.WorkflowActionContext) => {
              return prevValue + 23979;  // prevValue === 5979
          })
    .next((prevValue: number, context: vscode_helpers.WorkflowActionContext) => {
              // prevValue === 29958
              // context.value === 1000
              return '' + (prevValue * context.value);
          });

WORKFLOW.start().then((result: string) => {
    // result === '29958000'
}, (err) => {
    // this only happens on error
});
```

#### cloneObject [[&uarr;](#functions-)]

```typescript
const CLONED_OBJ = vscode_helpers.cloneObject({
    mk: 23979,
    tm: 5979,
});
```

#### cloneObjectFlat [[&uarr;](#functions-)]

```typescript
const CLONED_OBJ = vscode_helpers.cloneObjectFlat({
    mk: 23979,
    tm: function(a) {
        return a * (5979 * this.mk);
    },
});

CLONED_OBJ.mk = 1000;
CLONED_OBJ.tm(2000);  // 11.958.000.000 === 2000 * (5979 * 1000)
```

#### compareValues [[&uarr;](#functions-)]

```typescript
const VAL_1 = 1;
const VAL_2 = 2;

// SORTED_VALUES[0] === VAL_2
// SORTED_VALUES[1] === VAL_1
const SORTED_VALUES = [ VAL_1, VAL_2 ].sort((x, y) => {
    return vscode_helpers.compareValues(y, x);
});
```

#### compareValuesBy [[&uarr;](#functions-)]

```typescript
const OBJ_1 = { sortValue: 1 };
const OBJ_2 = { sortValue: 2 };

// SORTED_OBJS[0] === OBJ_2
// SORTED_OBJS[1] === OBJ_1
const SORTED_OBJS = [ OBJ_1, OBJ_2 ].sort((x, y) => {
    return vscode_helpers.compareValuesBy(y, x,
                                          i => i.sortValue);
});
```

#### createDirectoryIfNeeded [[&uarr;](#functions-)]

```typescript
vscode_helpers.createDirectoryIfNeeded('/dir/to/create').then((hasBeenCreated: boolean) => {
    // hasBeenCreated === (false), if directory already exists
}, (err) => {
    // error
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

#### doesMatch [[&uarr;](#functions-)]

```typescript
vscode_helpers.doesMatch('my-file.txt', '*.txt');  // (true)
vscode_helpers.doesMatch('my-picture.jpg', [ '*.txt' ]);  // (false)
vscode_helpers.doesMatch('my-picture.jpg', [ '*.txt', '*.jpg' ]);  // (true)
```

#### exists [[&uarr;](#functions-)]

```typescript
vscode_helpers.exists('/path/of/thing/to/check', (doesExist: boolean) => {
    //TODO    
}, (err) => {
    // error
});
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
    'MK:{1} + TM:{0:trim,surround,leading_space}',
    5979,
    23979
);
```

#### formatArray [[&uarr;](#functions-)]

```typescript
// "MK:23979 + TM: '5979'"
let str_1 = vscode_helpers.formatArray(
    'MK:{1} + TM:{0:trim,surround,leading_space}',
    [ 5979, 23979 ]
);
```

#### from [[&uarr;](#functions-)]

s. [node-enumerable](https://github.com/mkloubert/node-enumerable)

```typescript
let seq = vscode_helpers.from([ 1, 2, 3 ])  // can also be a generator
                                            // or string
                        .select(x => '' + x)
                        .where(x => x !== '2')
                        .reverse();

for (const ITEM of seq) {
    // [0] '3'
    // [1] '1'
}
```

#### fromMarkdown [[&uarr;](#functions-)]

```typescript
let htmlFromMarkdown = vscode_helpers.fromMarkdown(
    'Vessel     | Captain\n-----------|-------------\nNCC-1701   | James T Kirk\nNCC-1701 A | James T Kirk\nNCC-1701 D | Picard'
);
```

#### glob [[&uarr;](#functions-)]

```typescript
vscode_helpers.glob([ '**/*.txt' ], {
    cwd: '/path/to/directory',
    ignore: [ '/log/**/*' ],
    root: '/path/to/directory',
}).then((matches: string[]) => {
    // 'matches' contains the found files
}, (err) => {
    // error
});
```

#### globSync [[&uarr;](#functions-)]

```typescript
let matches: string[] = vscode_helpers.globSync([ '**/*.txt' ], {
    cwd: '/path/to/directory',
    ignore: [ '/log/**/*' ],
    root: '/path/to/directory',
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
#### isBinaryContent [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

vscode_helpers.isBinaryContent( fs.readFileSync('./myPic.jpg') ).then((isBinary) => {
    // should be (true)
}, (err) => {
    // error
});
vscode_helpers.isBinaryContent( fs.readFileSync('./myText.txt') ).then((isBinary) => {
    // should be (false)
}, (err) => {
    // error
});
```

#### isBinaryContentSync [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

// should be (true)
vscode_helpers.isBinaryContentSync( fs.readFileSync('./myPic.jpeg') );
// should be (false)
vscode_helpers.isBinaryContentSync( fs.readFileSync('./myText.txt') );
```

#### isBlockDevice [[&uarr;](#functions-)]

```typescript
vscode_helpers.isBlockDevice('/path/to/check').then((isABlockDevice) => {
    // TODO
}, (err) => {
    // error
})
```

#### isBlockDeviceSync [[&uarr;](#functions-)]

```typescript
const IS_A_BLOCK_DEVICE: boolean = vscode_helpers.isBlockDeviceSync('/path/to/check');
```

#### isCharacterDevice [[&uarr;](#functions-)]

```typescript
vscode_helpers.isCharacterDevice('/path/to/check').then((isACharacterDevice) => {
    // TODO
}, (err) => {
    // error
})
```

#### isCharacterDeviceSync [[&uarr;](#functions-)]

```typescript
const IS_A_CHARACTER_DEVICE: boolean = vscode_helpers.isCharacterDeviceSync('/path/to/check');
```

#### isDirectory [[&uarr;](#functions-)]

```typescript
vscode_helpers.isDirectory('/path/to/check').then((isADirectory) => {
    // TODO
}, (err) => {
    // error
})
```

#### isDirectorySync [[&uarr;](#functions-)]

```typescript
const IS_A_DIRECTORY: boolean = vscode_helpers.isDirectorySync('/path/to/check');
```

#### isEmptyString [[&uarr;](#functions-)]

```typescript
vscode_helpers.isEmptyString( null );  // (true)
vscode_helpers.isEmptyString( undefined );  // (true)
vscode_helpers.isEmptyString( '123' );  // (false)
```

#### isFIFO [[&uarr;](#functions-)]

```typescript
vscode_helpers.isFIFO('/path/to/check').then((isAFIFO) => {
    // TODO
}, (err) => {
    // error
})
```

#### isFIFOSync [[&uarr;](#functions-)]

```typescript
const IS_A_FIFO: boolean = vscode_helpers.isFIFOSync('/path/to/check');
```

#### isFile [[&uarr;](#functions-)]

```typescript
vscode_helpers.isFile('/path/to/check').then((isAFile) => {
    // TODO
}, (err) => {
    // error
})
```

#### isFileSync [[&uarr;](#functions-)]

```typescript
const IS_A_FILE: boolean = vscode_helpers.isFileSync('/path/to/check');
```

#### isSocket [[&uarr;](#functions-)]

```typescript
vscode_helpers.isSocket('/path/to/check').then((isASocket) => {
    // TODO
}, (err) => {
    // error
})
```

#### isSocketSync [[&uarr;](#functions-)]

```typescript
const IS_A_SOCKET: boolean = vscode_helpers.isSocketSync('/path/to/check');
```

#### isSymbolicLink [[&uarr;](#functions-)]

```typescript
vscode_helpers.isSymbolicLink('/path/to/check').then((isASymbolicLink) => {
    // TODO
}, (err) => {
    // error
})
```

#### isSymbolicLinkSync [[&uarr;](#functions-)]

```typescript
const IS_A_SYMBOLIC_LINK: boolean = vscode_helpers.isSymbolicLinkSync('/path/to/check');
```

#### loadModule [[&uarr;](#functions-)]

```typescript
interface MyModule {
    execute(): any;
}

let mod = vscode_helpers.loadModule<MyModule>('/path/to/module.js');

let modResult = mod.execute();
```

### makeNonDisposable [[&uarr;](#functions-)]

```typescript
const OBJ = {
    dispose: () => {
        console.log('Disposed!');
    }
};

const OBJ_1 = vscode_helpers.makeNonDisposable( OBJ, false );
OBJ_1.dispose();  // does nothing

const OBJ_2 = vscode_helpers.makeNonDisposable( OBJ );
OBJ_2.dispose();  // throws an exception
```

#### normalizeString [[&uarr;](#functions-)]

```typescript
const str_1 = vscode_helpers.normalizeString('aBc');  // 'abc'
const str_2 = vscode_helpers.normalizeString(null);  // ''
const str_3 = vscode_helpers.normalizeString('aBc', s => s.troUpperCase());  // 'ABC'
```

#### readAll [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const STREAM = fs.createReadStream('./my-file.txt');

readAll( STREAM ).then((data: Buffer) => {
    // all data read
}, (err) => {
    // error
});
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
import * as Path from 'path';
import { ConfigurationChangeEvent, Uri } from 'vscode';

class MyWorkspace extends vscode_helpers.WorkspaceBase {
    private _configSrc: vscode_helpers.WorkspaceConfigSource;

    // this is important for 'onDidChangeConfiguration' (s. below)
    public get configSource() {
        return this._configSrc;
    }    

    public async initialize() {
        // initialize your workspace here

        this._configSrc = {
            section: 'my.extension',
            resource: Uri.file( Path.join(this.rootPath,
                                          '.vscode/settings.json') ),
        };
    }

    public async onDidChangeConfiguration(e: ConfigurationChangeEvent) {
        // is invoked when workspace config changed
    }
}

vscode_helpers.registerWorkspaceWatcher(async (event, folder, workspace?) => {
    if (event == vscode_helpers.WorkspaceWatcherEvent.Added) {
        const NEW_WORKSPACE = new MyWorkspace( folder );
        
        await NEW_WORKSPACE.initialize();
        
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

#### toStringSafe [[&uarr;](#functions-)]

```typescript
const str_1 = vscode_helpers.toStringSafe( 123 );  // '123'
const str_2 = vscode_helpers.toStringSafe( null );  // ''
const str_3 = vscode_helpers.toStringSafe( undefined, 'abc' );  // 'abc'
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

#### tryRemoveListener [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const STREAM = fs.createReadStream('./my-file.txt');

let dataListener = (chunk) => {
    //TODO
};

STREAM.on('data', dataListener);

STREAM.once('end', () => {
    vscode_helpers.tryRemoveListener('data',
                                     dataListener);
});
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

#### CacheProviderBase [[&uarr;](#classes-)]

```typescript
class MyCache extends vscode_helpers.CacheProviderBase {
    // implement abstract members here
}
```

#### DisposableBase [[&uarr;](#classes-)]

```typescript
class MyDisposable extends vscode_helpers.MyDisposable {
    protected onDispose() {
        // your custom logic
    }
}

vscode_helpers.tryDispose( new MyDisposable() );
```

#### MemoryCache [[&uarr;](#classes-)]

```typescript
const CACHE = new vscode_helpers.MemoryCache();

CACHE.get('a', 23979);  // 23979
CACHE.set('a', 5979);  // 5979
CACHE.has('a');  // (true)
CACHE.unset('a');
CACHE.has('a');  // (false)
```

#### WorkspaceBase [[&uarr;](#classes-)]

```typescript
import { ConfigurationChangeEvent, Uri } as vscode from 'vscode';

class MyWorkspace extends vscode_helpers.WorkspaceBase {
    private _configSrc: vscode_helpers.WorkspaceConfigSource;

    // this is important for 'onDidChangeConfiguration' (s. below)
    public get configSource() {
        return this._configSrc;
    }    

    public async initialize() {
        // initialize your workspace here

        this._configSrc = {
            section: 'my.extension',
            resource: Uri.file( Path.join(this.rootPath,
                                          '.vscode/settings.json') ),
        };
    }

    public async onDidChangeConfiguration(e: ConfigurationChangeEvent) {
        // is invoked when workspace config changed
    }
}
```

### Constants and variables [[&uarr;](#examples-)]

#### EVENTS [[&uarr;](#constants-and-variables-)]

```typescript
vscode_helpers.EVENTS.on('myEvent', (a, b) => {
    console.log('myEvent' + (a + b));
});

vscode_helpers.EVENTS
              .emit('myEvent', 5979, 23979);
```

#### SESSION [[&uarr;](#constants-and-variables-)]

```typescript
let var_1 = vscode_helpers.SESSION['a'];  // undefined (at the beginning)

vscode_helpers.SESSION['a'] = 5979;
let var_2 = vscode_helpers.SESSION['a'];  // 5979

delete vscode_helpers.SESSION['a'];
let var_3 = vscode_helpers.SESSION['a'];  // undefined
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
