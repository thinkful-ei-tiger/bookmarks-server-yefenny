const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world"', () => {
    return supertest(app)
      .get('/')
      .set('Authorization', 'bearer my-token')
      .expect(200, 'Hello! Welcome to the bookmarksApp');
  });
});
