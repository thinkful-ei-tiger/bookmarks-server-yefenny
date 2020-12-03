const app = require('../src/app.js');

describe('Validate token function', () => {
  it('return error 401 if not authorized', () => {
    return supertest(app).get('/').set('Authorization', 'bearer i').expect(401);
  });
});
