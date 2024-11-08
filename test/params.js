/**
 * params tests
 */
const http = require('node:http');
const assert = require('node:assert');

const Koa = require('koa');
const request = require('supertest');

const Router = require('..');

describe('params()', () => {
  it('single param registered before verb registered', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // works as expected
    assert.deepEqual(calls, ['param1', 'get1']);
  });

  it('single param registered after verb registered', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // works as expected
    assert.deepEqual(calls, ['param1', 'get1']);
  });

  it('multiple param registered before verb registered', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: only the LAST param handler (3) is called (i.e.: 'param3', 'get1')
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('multiple param registered before verb registered', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .post('/:id', (ctx) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      });

    app.use(router.routes());

    // NOTE that this would work as expected if we made a POST call since
    // the post handler was registered before the param calls.
    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: only the LAST param handler (3) is called (i.e.: 'param3', 'get1')
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('multiple param registered after verb registered', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param4');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param5');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param6');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param7');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // WORKS because all param() handlers were registered AFTER the get handler
    assert.deepEqual(calls, [
      'param1',
      'param2',
      'param3',
      'param4',
      'param5',
      'param6',
      'param7',
      'get1'
    ]);
  });

  it('intermingled param and verb registrations example 1', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .get('/:id', (ctx, next) => {
        calls.push('get1');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get2');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: results in duplcate handler calls:
    // `["param1", "param2", "param3", "get1", "param2", "param3", "get2"]`
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1', 'get2']);
  });

  it('intermingled param and verb registrations example 2 - GET', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .post('/:id', (ctx, next) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS, results in: `["param2", "param3", "get1"]`
    // The `post` handler does not effect how the GET is handled.
    // But note the next test below using the same exact router config
    // does pass when a POST call is made.
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('intermingled param and verb registrations example 2 - POST', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .post('/:id', (ctx, next) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .post('/test')
      .send({})
      .expect(200);

    // WORKS. Because only one `param()` handler was registered before the
    // `post()` handler was registered
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'post1']);
  });

  it('intermingled param and verb registrations example 3 - GET', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        return next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .post('/:id', (ctx, next) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: the first `param()` handler is never called.
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('with all handlers', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .all('/:id', (ctx, next) => {
        calls.push('all1');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .post('/:id', (ctx, next) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: param2 and param3 are once again called twice
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('with less specific `use` handlers', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .use('/', (ctx, next) => {
        calls.push('use1');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      })
      .post('/:id', (ctx, next) => {
        calls.push('post1');
        ctx.status = 200;
      })
      .param('id', (id, ctx, next) => {
        calls.push('param3');
        return next();
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: The additional `use` call has no effect.
    assert.deepEqual(calls, ['param1', 'param2', 'param3', 'get1']);
  });

  it('order of calls with less specific `use` handler', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        next();
      })
      .use('/', (ctx, next) => {
        calls.push('use1');
        next();
      })
      .use('/:id', (ctx, next) => {
        calls.push('use2');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param2');
        return next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAILS: `param2` handler is called twice.
    assert.deepEqual(calls, ['use1', 'param1', 'param2', 'use2', 'get1']);
  });

  it('params get "hoisted"', async () => {
    const app = new Koa();
    const router = new Router();
    const calls = [];

    router
      .use('/:id', (ctx, next) => {
        calls.push('use1');
        next();
      })
      .param('id', (id, ctx, next) => {
        calls.push('param1');
        next();
      })
      .get('/:id', (ctx) => {
        calls.push('get1');
        ctx.status = 200;
      });

    app.use(router.routes());

    const res = await request(http.createServer(app.callback()))
      .get('/test')
      .expect(200);

    // FAIL: param1 gets called twice again.
    // I'm actually not sure what the *expected* order is here. The `params`
    // handler get "hoisted", but  it's not totally clear that his should
    // happen in all cases, and it's not documented in the README or API docs
    // anywhere (there's a comment in the code, though)
    assert.deepEqual(calls, ['param1', 'use1', 'get1']);
  });
});
