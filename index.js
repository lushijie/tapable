/**
 * Sync*类型的钩子, 只能使用tap注册，不能使用tapPromise和tapAsync注册，通过调用 call 方式调用
 * Async*类型的钩子, 支持tap、tapPromise、tapAsync注册, 通过调用callAsync 、promise方式调用
 *    promise 可以触发 tap、tapPromise、tapAsync
 *    callAsync 可以触发 tap、tapAsync
 *    call 触发 tap
 */
const {
  Tapable,
  SyncHook,
  SyncLoopHook,
  SyncBailHook,
  SyncWaterfallHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} = require('tapable');


/**
 * 同步钩子
 * 按照注册顺序执行
 */
function syncHook() {
  console.log('=== 同步钩子 ===');

  // 不带参数
  const hook11 = new SyncHook();
  hook11.tap('hook11-1', () => {
    console.log('=> hook11-1...');
  });
  hook11.tap('hook11-2', () => {
    console.log('=> hook11-2...');
  });
  hook11.call();

  // 带参数
  const hook12 = new SyncHook(['arg']);;
  hook12.tap('hook12-1', (arg) => {
    console.log('=> hook12-1...', arg);
  });
  hook12.call('hook12参数');
}

/**
 * 同步 bail 钩子
 * 一旦中间有 hook 返回 true，则后续的 hook 不再执行
 */
function syncBailHook() {
  console.log('=== 同步 bail 钩子 ===');
  const hook13 = new SyncBailHook();
  hook13.tap('hook13-1', () => {
    console.log('=> hook13-1...');
    return true;
  });
  hook13.tap('hook13-2', () => {
    // hook13-1 返回 true，此钩子不再执行
    console.log('=> hook13-2...');
    return true;
  });
  hook13.call();
}

/**
 * 同步瀑布流钩子
 * 串行瀑布流，第一个 hook 返回值作为第二个 hook 的输入
 */
function syncWaterfallHook() {
  console.log('=== 同步瀑布流钩子 ===');

  const hook14 = new SyncWaterfallHook(['arg']);
  hook14.tap('hook14-1', (data) => {
    console.log('=> hook14-1...', data);
    return data;
  });
  hook14.tap('hook14-2', (data) => {
    console.log('=> hook14-2...', data);
  });
  hook14.call('hook14参数');
}

/**
 * 同步 loop 钩子
 * 监听函数返回true表示继续循环，返回undefine表示结束循环
 */
function syncLoopHook() {
  console.log('=== 同步 loop 钩子 ===');
  const hook15 = new SyncLoopHook();
  let count = 0;
  hook15.tap('hook15',function(){
    count ++;
    console.log('=> hook15-1... 计数:', count);
    if(count === 3) {
      return;
    } else {
      return true;
    }
  });
  hook15.call();
}

/**
 * 异步串行钩子
 * 前一个异步钩子 callback 之后，后续的钩子才会执行
 */
function asyncSeriesHook() {
  console.log('=== 异步串行钩子 ===')
  const hook21 = new AsyncSeriesHook(['arg']);
  hook21.tap('hook21-1', (arg) => {
    console.log('=> hook21-1...', arg);
  });
  hook21.tapAsync('hook21-2',(arg, cb) => {
    setTimeout(() => {
      console.log('=> hook21-2...', arg);
      cb();
    }, 1000);
  });

  // 异步串行执行，hook21-3 在 hook21-2 callback 之后才会继续执行
  hook21.tap('hook21-3',(arg) => {
    console.log('=> hook21-3...', arg);
  });
  hook21.callAsync('hook21参数', err => {
    err && console.log(err);
  });
}

/**
 * 异步串行 bail 钩子
 * 异步串行执行，中间有 hook 返回true，则后续的 hook 不再执行
 */
function asyncSeriesBailHook() {
  console.log('=== 异步串行 bail 钩子 ===');
  const hook22 = new AsyncSeriesBailHook(['arg']);
  hook22.tap('hook22-1', (arg) => {
    console.log('=> hook22-1...', arg);
    return arg; // 此处返回真导致 hook22-2 不再执行
  });
  hook22.tap('hook22-2',(arg) => {
    console.log('=> hook22-2...', arg);
  });
  hook22.callAsync('hook22参数', err => {
    err && console.log(err);
  });
}

/**
 * 异步串行瀑布流钩子
 */
function asyncSeriesWaterfallHook() {
  console.log('=== 异步串行瀑布流钩子 ===')
  // 前一个 hook 的返回值会作为下一个 hook 的输入
  // 如果紧邻的前一个没有返回，会找更前面的一个的返回值
  const hook23 = new AsyncSeriesWaterfallHook(['arg']);
  hook23.tap('hook23-1', () => {
    console.log('=> hook23-1...');
    return 'hook23-1 result';
  });
  hook23.tapAsync('hook23-2', (arg, cb) => {
    setTimeout(() => {
      console.log('=> hook23-2...', arg);
      cb(null, 'hook23-2 result');
    });
  });

  hook23.tap('hook23-3',(arg) => {
    console.log('=> hook23-3...', arg);
    return 'hook23-3 result';
  });

  hook23.tapAsync('hook23-4',(arg, cb) => {
    setTimeout(() => {
      console.log('=> hook23-4...', arg);
      cb();
    });
  });
  hook23.callAsync(null, err => {
    err && console.log(err);
  });
}

/**
 * 异步并行钩子
 */
function asyncParallelHook() {
  console.log('=== 异步并行钩子 ===');

  const hook31 = new AsyncParallelHook(['arg']);
  hook31.tap('hook31-1', (arg) => {
    console.log('=> hook31-1...', arg);
  });
  hook31.tapAsync('hook31-2', (arg, cb) => {
    setTimeout(() => {
      console.log('=> hook31-2...', arg);
      cb();
    }, 50);
  });
  hook31.tapAsync('hook31-3', (arg, cb) => {
    setTimeout(() => {
      console.log('=> hook31-3...', arg);
      cb();
    }, 0);
  });

  hook31.tapPromise('hook31-4', arg => {
    return new Promise((resolve) => {
      resolve(arg);
    });
  });

  hook31.promise('hook31参数').then((data) => { // 可以触发tap、tapAsync、tapPromise
    // 此处 data 为 undefined, 如果有此需求请使用 AsyncParallelBailHook
    console.log('=> hook31..... 全部结束');
  });

  // hook31.callAsync('hook31参数', err => { // 只可以触发 tap、tapAsync
  //   err && console.log(err);
  // });
}

/**
 * 异步并行 bail 钩子
 */
function asyncParallelBailHook() {
  console.log('=== 异步并行 bail 钩子 ===')
  const hook32 = new AsyncParallelBailHook(['arg']);
  hook32.tap('hook32-1',(arg) => {
    console.log('=> hook32-1...', arg);
    // return true; // 如果返回true， 后面注册的 hook 将不再执行
  });

  hook32.tapAsync('hook32-2', (arg, cb) => {
    setTimeout(() => {
      console.log('=> hook32-2...', arg);
      cb(null, arg + '-2')
    }, 50);
  });

  hook32.tapAsync('hook32-3',(arg, cb) => {
    setTimeout(() => {
      console.log('=> hook32-3...', arg);
      cb(null, arg + '-4')
    }, 0);
  });

  hook32.tapPromise('hook32-4', arg => {
    return new Promise((resolve) => {
      console.log('=> hook32-4...', arg);
      resolve(arg);
    });
  });

  // hook32.callAsync('hook32参数', err => {
  //   err && console.log(err);
  // });

  hook32.promise('hook31参数').then((data) => {
    console.log(data); // 第一个顺序注册的 tapAsync callback 的结果
  });
}

/**
 * extends Tapable 使用方式
 */
function classHook() {
  class Tap extends Tapable {
    constructor() {
      super();
      this.hooks = {
        run: new SyncHook(['word1', 'word2']),
      };
    }

    run(word1, word2) {
      this.hooks.run.call(word1, word2);
    }
  }

  const tap = new Tap();

  // 如果未注册将 .run 方法将不执行任何操作
  tap.hooks.run.tap('run', (word1, word2) => {
    console.log('=> class run:', word1, word2);
  });

  tap.run('hello', 'world');
}

// syncHook();
// syncBailHook();
// syncLoopHook();
// syncWaterfallHook();

// asyncSeriesHook();
// asyncSeriesBailHook();
// asyncSeriesWaterfallHook();

// asyncParallelHook();
// asyncParallelBailHook();

// classHook();


