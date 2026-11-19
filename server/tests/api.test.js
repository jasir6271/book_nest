import test from 'node:test';
import assert from 'node:assert/strict';
process.env.JWT_SECRET = 'test-only-secret';
const { default: app } = await import('../app.js');
const { Book } = await import('../models/index.js');
const { default: jwt } = await import('jsonwebtoken');
const { jwtSecret } = await import('../config.js');

test('public search pagination, protected writes, and token claims', async () => {
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 const base = `http://127.0.0.1:${server.address().port}`;
 const originalFind = Book.find, originalCount = Book.countDocuments;
 try {
  let observedFilter, skipped, limited;
  Book.find = filter => { observedFilter = filter; return { sort() { return this; }, skip(value) { skipped = value; return this; }, limit(value) { limited = value; return Promise.resolve([{title:'Martin Book'}]); } }; };
  Book.countDocuments = async filter => { assert.deepEqual(filter, observedFilter); return 12; };
  const response = await fetch(base+'/api/books?page=2&limit=5&search=%20martin%20');
  assert.equal(response.status,200);
  const body = await response.json();
  assert.equal(body.totalItems,12); assert.equal(body.totalPages,3);
  assert.equal(skipped,5); assert.equal(limited,5);
  assert.equal(observedFilter.$or[0].title.$regex,'martin');
  assert.equal(observedFilter.$or[1].author.$options,'i');
  assert.equal((await fetch(base+'/api/books',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  assert.equal((await fetch(base+'/api/auth/me',{headers:{Authorization:'Bearer invalid'}})).status,401);
  const claims = {id:'123',username:'Reader',email:'reader@example.com'};
  const token = jwt.sign(claims,jwtSecret,{expiresIn:'1h'});
  const me = await (await fetch(base+'/api/auth/me',{headers:{Authorization:`Bearer ${token}`}})).json();
  assert.equal(me.user.id,claims.id); assert.equal(me.user.exp-me.user.iat,3600);
 } finally { Book.find=originalFind; Book.countDocuments=originalCount; await new Promise(resolve=>server.close(resolve)); }
});
