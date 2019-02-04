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
     * [createChromeClient](#createchromeclient-)
     * [createCompletedAction](#createcompletedaction-)
     * [createDevToolsClient](#createdevtoolsclient-)
     * [createDirectoryIfNeeded](#createdirectoryifneeded-)
     * [createGitClient](#creategitclient-)
     * [createGitClientSync](#creategitclientsync-)
     * [createInterval](#createinterval-)
     * [createLogger](#createlogger-)
     * [createQueue](#createqueue-)
     * [createTimeout](#createtimeout-)
     * [DELETE](#delete-)
     * [doesMatch](#doesmatch-)
     * [execFile](#execfile-)
     * [exists](#exists-)
     * [fastGlob](#fastglob-)
     * [fastGlobSync](#fastglobsync-)
     * [filterExtensionNotifications](#filterextensionnotifications-)
     * [forEachAsync](#foreachasync-)
     * [format](#format-)
     * [formatArray](#formatarray-)
     * [from](#from-)
     * [fromMarkdown](#frommarkdown-)
     * [GET](#get-)
     * [getExtensionNotifications](#getextensionnotifications-)
     * [getExtensionRoot](#getextensionroot-)
     * [getPackageFile](#getpackagefile-)
     * [getPackageFileSync](#getpackagefilesync-)
     * [glob](#glob-)
     * [globSync](#globsync-)
     * [guid](#guid-)
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
     * [now](#now-)
     * [openAndShowTextDocument](#openandshowtextdocument-)
     * [PATCH](#patch-)
     * [POST](#post-)
     * [PUT](#put-)
     * [randomBytes](#randombytes-)
     * [range](#range-)
     * [registerWorkspaceWatcher](#registerworkspacewatcher-)
     * [readAll](#readall-)
     * [repeat](#repeat-)
     * [request](#request-)
     * [setExtensionRoot](#setextensionroot-)
     * [size](#size-)
     * [sizeSync](#sizeSync-)
     * [sleep](#sleep-)
     * [startWatch](#startwatch-)
     * [tempFile](#tempfile-)
     * [tempFileSync](#tempfilesync-)
     * [toArray](#toarray-)
     * [toBooleanSafe](#tobooleansafe-)
     * [toEOL](#toeol-)
     * [toStringSafe](#tostringsafe-)
     * [tryClearInterval](#tryclearinterval-)
     * [tryClearTimeout](#trycleartimeout-)
     * [tryDispose](#trydispose-)
     * [tryDisposeAndDelete](#trydisposeanddelete-)
     * [tryCreateGitClient](#trycreategitclient-)
     * [tryCreateGitClientSync](#trycreategitclientsync-)
     * [tryRemoveAllListeners](#tryremovealllisteners-)
     * [tryRemoveListener](#tryremovelistener-)
     * [using](#using-)
     * [usingSync](#usingsync-)
     * [utcNow](#utcnow-)
     * [uuid](#uuid-)
     * [waitWhile](#waitwhile-)
     * [withProgress](#withprogress-)
   * [Classes](#classes-)
     * [CacheProviderBase](#cacheproviderbase-)
     * [DisposableBase](#disposablebase-)
     * [MemoryCache](#memorycache-)
     * [StopWatch](#stopwatch-)
     * [WorkspaceBase](#workspacebase-)
   * [Constants and variables](#constants-and-variables-)
     * [EVENTS](#events-)
     * [IS_*](#is_-)
     * [QUEUE](#queue-)
     * [SESSION](#session-)
4. [Branches](#branches-)     
5. [Support and contribute](#support-and-contribute-)
6. [Documentation](#documentation-)

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

An example of a [multi-root workspace](https://code.visualstudio.com/docs/editor/multi-root-workspaces) ready extension (`extension.ts`):

```typescript
'use strict';

import * as Path from 'path';
import * as vscode from 'vscode';
import * as vscode_helpers from 'vscode-helpers';

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

    public async onDidChangeConfiguration(e) {
        const NEW_CONFIG = vscode.workspace.getConfiguration(
            this.configSource.section,
            this.configSource.resource
        );

        // handle new config here
    }
}

let workspaceWatcher: vscode_helpers.WorkspaceWatcherContext<MyWorkspace>;

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        workspaceWatcher = 
            vscode_helpers.registerWorkspaceWatcher<MyWorkspace>(context, async (ev, folder) => {
                if (ev === vscode_helpers.WorkspaceWatcherEvent.Added) {
                    const NEW_WORKSPACE = new MyWorkspace(folder);

                    await NEW_WORKSPACE.initialize();

                    return NEW_WORKSPACE;
                }            
            }),
    );

    await workspaceWatcher.reload();
}

export async function deactivate() {
    //TODO
}
```

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

#### createChromeClient [[&uarr;](#functions-)]

```typescript
const CLIENT = vscode_helpers.createChromeClient({
    host: 'localhost',
    port: 9222,
});

const PAGES = await CLIENT.getPages();
for (const P of PAGES) {
    //TODO
}
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

#### createDevToolsClient [[&uarr;](#functions-)]

```typescript
const CLIENT = vscode_helpers.createDevToolsClient({
    host: 'localhost',
    port: 9222,
});

const PAGES = await CLIENT.getPages();
for (const P of PAGES) {
    //TODO
}
```

#### createDirectoryIfNeeded [[&uarr;](#functions-)]

```typescript
vscode_helpers.createDirectoryIfNeeded('/dir/to/create').then((hasBeenCreated: boolean) => {
    // hasBeenCreated === (false), if directory already exists
}, (err) => {
    // error
});
```

#### createGitClient [[&uarr;](#functions-)]

```typescript
try {
    const CLIENT = await vscode_helpers.createGitClient();

    const STD_OUT: string = (await CLIENT.exec([ '--version' ])).stdOut;

    console.log( STD_OUT );
} catch (e) {
    // no git client found
}
```

#### createGitClientSync [[&uarr;](#functions-)]

```typescript
try {
    const CLIENT = vscode_helpers.createGitClientSync();

    console.log(
        CLIENT.execSync([ '--version' ]);
    );
} catch (e) {
    // no git client found
}
```

#### createInterval [[&uarr;](#functions-)]

```typescript
const INTERVAL = vscode_helpers.createInterval(() => {
    //TODO
}, 1000);

INTERVAL.dispose();  // same as 'clearInterval'
```

#### createLogger [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const LOGGER = vscode_helpers.createLogger((log) => {
    fs.appendFileSync('./logFile.txt', log.message + "\r\n", 'utf8');
});

LOGGER.info('Hello, LOG!');
```

#### createQueue [[&uarr;](#functions-)]

```typescript
/**
 * (Default) Options:
 * 
 * {
 *     autoStart: true,
 *     concurrency: 1,
 * }
 */
const MY_QUEUE = vscode_helpers.createQueue();

vscode_helpers.range(0, 23979).forEach((x) => {

    MY_QUEUE.add(async () => {
        return await vscode_helpers.invokeAfter(() => {
            return x * 5979;
        }, 100));
    }).then((result: number) => {
        // succeeded

        console.log( `MY_QUEUE result of '${ x }': ${ result }` );
    }).catch((err) => {
        // error
    });

});
```

#### createTimeout [[&uarr;](#functions-)]

```typescript
const TIMEOUT = vscode_helpers.createTimeout(() => {
    //TODO
}, 10000);

TIMEOUT.dispose();  // same as 'clearTimeout'
```

#### DELETE [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.DELETE('https://example.com/api/users/19861222');
```

#### doesMatch [[&uarr;](#functions-)]

```typescript
vscode_helpers.doesMatch('my-file.txt', '*.txt');  // (true)
vscode_helpers.doesMatch('my-picture.jpg', [ '*.txt' ]);  // (false)
vscode_helpers.doesMatch('my-picture.jpg', [ '*.txt', '*.jpg' ]);  // (true)
```

#### execFile [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.execFile('/path/to/execiutable', [ '--version' ]);

const STD_ERR = RESULT.stdErr;
const STD_OUT = RESULT.stdOut;
```

#### exists [[&uarr;](#functions-)]

```typescript
vscode_helpers.exists('/path/of/thing/to/check', (doesExist: boolean) => {
    //TODO    
}, (err) => {
    // error
});
```

#### fastGlob [[&uarr;](#functions-)]

```typescript
const MATCHES = await vscode_helpers.fastGlob([ '**/*.txt' ], {
    cwd: '/path/to/directory',
    ignore: [ '/log/**/*' ],
});
```

#### fastGlobSync [[&uarr;](#functions-)]

```typescript
const MATCHES = vscode_helpers.fastGlobSync([ '**/*.txt' ], {
    cwd: '/path/to/directory',
    ignore: [ '/log/**/*' ],
});
```

#### filterExtensionNotifications [[&uarr;](#functions-)]

```typescript
const ALL_NOTIFICATIONS: vscode_helpers.ExtensionNotification[] =
    await vscode_helpers.getExtensionNotifications('https://mkloubert.github.io/notifications/vscode-deploy-reloaded.json');

const FILTERED_NOTIFICATION = vscode_helpers.filterExtensionNotifications(
    ALL_NOTIFICATIONS, {
        'version': '1.0.0'  // version of the current extension
    }
);

for (const NOTE of FILTERED_NOTIFICATION) {
    console.log(
        NOTE.title
    );
}
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

#### GET [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.GET('https://example.com/api/users/5979');

const USER_DATA = JSON.parse(
    (await RESULT.readBody()).toString('utf8')
);
```

#### getExtensionNotifications [[&uarr;](#functions-)]

```typescript
const NOTIFICATIONS: vscode_helpers.ExtensionNotification[] =
    await vscode_helpers.getExtensionNotifications('https://mkloubert.github.io/notifications/vscode-deploy-reloaded.json');

for (const NOTE of NOTIFICATIONS) {
    console.log(
        NOTE.title
    );
}
```

#### getExtensionRoot [[&uarr;](#functions-)]

```typescript
console.log(
    vscode_helpers.getExtensionRoot()
);
```

#### getPackageFile [[&uarr;](#functions-)]

```typescript
const PACKAGE_JSON: vscode_helpers.PackageFile = 
    await vscode_helpers.getPackageFile();

console.log(
    PACKAGE_JSON.name + ' ' + PACKAGE_JSON.version
);
```

#### getPackageFileSync [[&uarr;](#functions-)]

```typescript
const PACKAGE_JSON: vscode_helpers.PackageFile = 
    vscode_helpers.getPackageFileSync();

console.log(
    PACKAGE_JSON.name + ' ' + PACKAGE_JSON.version
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

#### guid [[&uarr;](#functions-)]

```typescript
let guid_v4_1 = vscode_helpers.guid();
let guid_v4_2 = vscode_helpers.guid('4');
let guid_v4_3 = vscode_helpers.guid('v4');

let guid_v5_1 = vscode_helpers.guid('5');
let guid_v5_2 = vscode_helpers.guid('v5');

let guid_v1_1 = vscode_helpers.guid('1');
let guid_v1_2 = vscode_helpers.guid('v1');
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
const str_3 = vscode_helpers.normalizeString('aBc', s => s.toUpperCase());  // 'ABC'
```

#### now [[&uarr;](#functions-)]

s. [Moment Timezone](https://momentjs.com/timezone/) for more information about using (optional) timezones.

```typescript
const NOW = vscode_helpers.now('America/New_York')  // optional
                          .format('DD.MM.YYYY HH:mm:ss');
```

#### openAndShowTextDocument [[&uarr;](#functions-)]

```typescript
// empty (plain text)
const EDITOR_1 = await vscode_helpers.openAndShowTextDocument();

// from file
const EDITOR_2 = await vscode_helpers.openAndShowTextDocument('/path/to/file');

// with initial content
const EDITOR_3 = await vscode_helpers.openAndShowTextDocument({
    language: 'typescript',
    content: `interface Pet {
    name: string;
    owner: string;
}`,
});
```

#### PATCH [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.PATCH('https://example.com/api/users/23979', JSON.stringify({
    displayName: 'Marcel Kloubert',
}), {
    'Content-Type': 'application/json; charset=utf8',
});
```

#### POST [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.POST('https://example.com/api/users/23979', JSON.stringify({
    displayName: 'Marcel Kloubert',
    userName: 'mkloubert',
    country: 'Germany',
}), {
    'Content-Type': 'application/json; charset=utf8',
});
```

#### PUT [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.PUT('https://example.com/api/users/23979', JSON.stringify({
    displayName: 'Marcel Kloubert',
}), {
    'Content-Type': 'application/json; charset=utf8',
});
```

#### randomBytes [[&uarr;](#functions-)]

```typescript
vscode_helpers.randomBytes(5979).then((bytes: Buffer) => {
    // 5979 random bytes are stored
    // in 'bytes' now
}, (err) => {
    // error
});
```

#### range [[&uarr;](#functions-)]

s. [node-enumerable](https://github.com/mkloubert/node-enumerable)

```typescript
vscode_helpers.range(1, 5).forEach((x) => {
    // x[0] === 1
    // x[1] === 2
    // x[2] === 3
    // x[3] === 4
    // x[4] === 5
});
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

#### repeat [[&uarr;](#functions-)]

s. [node-enumerable](https://github.com/mkloubert/node-enumerable)

```typescript
// 5979 'TM' strings
vscode_helpers.repeat('TM', 5979).forEach((x) => {
    //TODO
});
```

#### request [[&uarr;](#functions-)]

```typescript
const RESULT = await vscode_helpers.request('POST', 'https://example.com/api/users/23979', JSON.stringify({
    displayName: 'Marcel Kloubert',
    userName: 'mkloubert',
    country: 'Germany',
}), {
    'Content-Type': 'application/json; charset=utf8',
});
```

#### setExtensionRoot [[&uarr;](#functions-)]

```typescript
vscode_helpers.setExtensionRoot(
    __dirname
);

console.log(
    vscode_helpers.getExtensionRoot()
);
```

#### size [[&uarr;](#functions-)]

```typescript
vscode_helpers.size('/path/to/a/file').then((fileSize: number) => {
    // 'fileSize' stores the file size in bytes
}, (err) => {
    // ERROR
});

// use 'stat()' function instead
// s. https://nodejs.org/api/fs.html#fs_fs_stat_path_callback
vscode_helpers.size('/path/to/a/file', false).then((fileSize: number) => {    
}, (err) => {
});
```

#### sizeSync [[&uarr;](#functions-)]

```typescript
const FILESIZE_1 = vscode_helpers.sizeSync('/path/to/a/file');

// use 'statSync()' function instead
// s. https://nodejs.org/api/fs.html#fs_fs_statsync_path
const FILESIZE_2 = vscode_helpers.sizeSync('/path/to/a/file', false);
```

#### sleep [[&uarr;](#functions-)]

```typescript
vscode_helpers.sleep(23979).then(() => {
    // 23979 milliseconds gone
}, (err) => {
    // is invoked on error
});
```

#### startWatch [[&uarr;](#functions-)]

```typescript
const WATCH = vscode_helpers.startWatch();

vscode_helpers.sleep(1000).then(() => {
    const MS = WATCH.stop();  // 'MS' should be a least 1000    
});
```

#### toBooleanSafe [[&uarr;](#functions-)]

```typescript
const bool_1 = vscode_helpers.toBooleanSafe( true );  // (true)
const bool_2 = vscode_helpers.toBooleanSafe( null );  // (false)
const bool_3 = vscode_helpers.toBooleanSafe( undefined, true );  // (true)
```

#### tempFile [[&uarr;](#functions-)]

```typescript
vscode_helpers.tempFile((pathToTempFile: string) => {
    //TODO

    return 5979;
}).then((result) => {
    // result === 5979
}, (err) => {
    // ERROR!
});
```

#### tempFileSync [[&uarr;](#functions-)]

```typescript
let result = vscode_helpers.tempFileSync((pathToTempFile: string) => {
    //TODO

    return 23979;
});

// result === 23979
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
import { EndOfLine } from 'vscode';

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

#### tryCreateGitClient [[&uarr;](#functions-)]

```typescript
const CLIENT = await vscode_helpers.tryCreateGitClient();

if (false !== CLIENT) {
    const STD_OUT: string = (await CLIENT.exec([ '--version' ])).stdOut;

    console.log( STD_OUT );
} else {
    // no git client found
}
```

#### tryCreateGitClientSync [[&uarr;](#functions-)]

```typescript
const CLIENT = vscode_helpers.tryCreateGitClientSync();

if (false !== CLIENT) {
    console.log(
        CLIENT.execSync([ '--version' ]);
    );
} else {
    // no git client found
}
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

#### tryDisposeAndDelete [[&uarr;](#functions-)]

```typescript
const OBJ = {
    dispose: () => {
        //TODO
    }
};

const PARENT = { 'obj_key': OBJ };

vscode_helpers.tryDisposeAndDelete( PARENT, 'obj_key' );
// 'PARENT' should not contain an object in 'obj_key' anymore
```

#### tryRemoveAllListeners [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const STREAM = fs.createReadStream('./my-file.txt');

STREAM.once('error', (err) => {
    //TODO

    vscode_helpers.tryRemoveAllListeners(STREAM);
});

STREAM.once('end', () => {
    vscode_helpers.tryRemoveAllListeners(STREAM);
});

STREAM.on('data', (chunk) => {
    //TODO
});
```

#### tryRemoveListener [[&uarr;](#functions-)]

```typescript
import * as fs from 'fs';

const STREAM = fs.createReadStream('./my-file.txt');

const DATA_LISTENER = (chunk) => {
    //TODO
};

STREAM.on('data', DATA_LISTENER);

STREAM.once('end', () => {
    vscode_helpers.tryRemoveListener(STREAM,
                                     'data', DATA_LISTENER);
});
```

#### using [[&uarr;](#functions-)]

```typescript
const MY_OBJECT = {
    value: 5979,

    dispose: function() {
        console.log("I have been disposed with value " + this.value);
    }
};

vscode_helpers.using(MY_OBJECT, (obj) => {
    return obj.value + 23979;
}).then((result) => {
    // result === 29958
}, (err) => {
    // on error
});
```

#### usingSync [[&uarr;](#functions-)]

```typescript
const MY_OBJECT = {
    value: 23979,

    dispose: function() {
        console.log("I have been disposed with value " + this.value);
    }
};

// RESULT === 29958
const RESULT = vscode_helpers.usingSync(MY_OBJECT, (obj) => {
    return obj.value + 5979;
});
```

#### utcNow [[&uarr;](#functions-)]

```typescript
const UTC_NOW = vscode_helpers.utcNow()
                              .format('DD.MM.YYYY HH:mm:ss');
```

#### uuid [[&uarr;](#functions-)]

```typescript
let uuid_v4_1 = vscode_helpers.uuid();
let uuid_v4_2 = vscode_helpers.uuid('4');
let uuid_v4_3 = vscode_helpers.uuid('v4');

let uuid_v5_1 = vscode_helpers.uuid('5');
let uuid_v5_2 = vscode_helpers.uuid('v5');

let uuid_v1_1 = vscode_helpers.uuid('1');
let uuid_v1_2 = vscode_helpers.uuid('v1');
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
import { ProgressLocation } from 'vscode';

vscode_helpers.withProgress((context) => {
    let res = 0;

    context.increment = 10;  // increment by 10% after each update

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

#### StopWatch [[&uarr;](#classes-)]

```typescript
const WATCH = new vscode_helpers.StopWatch();
WATCH.start();

vscode_helpers.sleep(1000).then(() => {
    const MS = WATCH.stop();  // 'MS' should be a least 1000    
});
```

#### WorkspaceBase [[&uarr;](#classes-)]

```typescript
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
```

### Constants and variables [[&uarr;](#examples-)]

#### EVENTS [[&uarr;](#constants-and-variables-)]

```typescript
vscode_helpers.EVENTS.on('myEvent', (a, b) => {
    console.log('myEvent: ' + (a + b));
});

vscode_helpers.EVENTS
              .emit('myEvent', 5979, 23979);
```

#### IS_* [[&uarr;](#constants-and-variables-)]

```typescript
vscode_helpers.IS_AIX;  // AIX
vscode_helpers.IS_FREE_BSD;  // Free BSD
vscode_helpers.IS_LINUX;  // Linux
vscode_helpers.IS_MAC;  // Mac OS
vscode_helpers.IS_OPEN_BSD;  // Open BSD
vscode_helpers.IS_SUNOS;  // Sun OS
vscode_helpers.IS_WINDOWS;  // Windows
```

#### QUEUE [[&uarr;](#constants-and-variables-)]

```typescript
vscode_helpers.range(0, 5979).forEach((x) => {

    vscode_helpers.QUEUE.add(async () => {
        return await vscode_helpers.invokeAfter(() => {
            return x * 23979;
        }, 100));
    }).then((result: number) => {
        // succeeded

        console.log( `QUEUE result of '${ x }': ${ result }` );
    }).catch((err) => {
        // error
    });

});
```

#### SESSION [[&uarr;](#constants-and-variables-)]

```typescript
let var_1 = vscode_helpers.SESSION['a'];  // undefined (at the beginning)

vscode_helpers.SESSION['a'] = 5979;
let var_2 = vscode_helpers.SESSION['a'];  // 5979

delete vscode_helpers.SESSION['a'];
let var_3 = vscode_helpers.SESSION['a'];  // undefined
```

## Branches [[&uarr;](#table-of-contents)]

| Name | minimum Visual Studio Code version |
| ---- | --------- |
| [v4](https://github.com/mkloubert/vscode-helpers/tree/v4) (current) | `^1.30.0` |
| [v3](https://github.com/mkloubert/vscode-helpers/tree/v3) (current) | `^1.30.0` |
| [v2](https://github.com/mkloubert/vscode-helpers/tree/v2) | `^1.23.0` |
| [v1](https://github.com/mkloubert/vscode-helpers/tree/v1) | `^1.22.0` |
| [beta](https://github.com/mkloubert/vscode-helpers/tree/beta) | `^1.20.0` |

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
