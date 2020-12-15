// const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarks } = require('./bookmarks.fixtures');

describe.skip('Bookmarks endpoints', () => {
  let db;
  const bookmarks = makeBookmarks();
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('Clean table', () => db('bookmarks').truncate());

  afterEach('clean table', () => db('bookmarks').truncate());
  describe('GET /articles ', () => {
    context('Given bookmarks has data', () => {
      beforeEach('insert data into bookmarks', () =>
        db('bookmarks').insert(bookmarks)
      );
      it('get all bookmarks with code 200', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', 'bearer my-token')
          .expect(200)
          .expect('Content-type', /json/)
          .then((res) => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf.at.least(1);
            const firstBookmark = res.body[0];
            expect(firstBookmark).to.be.an('object');
            expect(res.body[0]).to.deep.include.keys('id', 'title', 'url');
          });
      });
    });
    context('Given bookmarks has no data', () => {
      it('returns empty array ', () => {
        return supertest(app)
          .get('/bookmarks/')
          .set('Authorization', 'bearer my-token')
          .expect(200, []);
      });
    });
  });
});
