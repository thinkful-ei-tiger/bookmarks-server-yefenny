const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarks } = require('./bookmarks.fixtures');

describe.only('Bookmarks endpoints', () => {
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
  describe('GET /api/bookmarks ', () => {
    context('Given bookmarks has data', () => {
      beforeEach('insert data into bookmarks', () =>
        db('bookmarks').insert(bookmarks)
      );
      it('get all bookmarks with code 200', () => {
        return supertest(app)
          .get('/api/bookmarks')
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
          .get('/api/bookmarks/')
          .set('Authorization', 'bearer my-token')
          .expect(200, []);
      });
    });
  });
  describe('GET /api/bookmarks/:id', () => {
    context('given bookmarks has data', () => {
      beforeEach('insert data', () => db('bookmarks').insert(bookmarks));

      it('returns bookmarks in correct format', () => {
        return supertest(app)
          .get(`/api/bookmarks/${bookmarks[0].id}`)
          .set('Authorization', 'bearer my-token')
          .expect(200, bookmarks[0]);
      });
    });
    context('given bookmarks has no data', () => {
      it(`returns 404 'Article doesn't exists' `, () => {
        return supertest(app)
          .get(`/api/bookmarks/3`)
          .set('Authorization', 'bearer my-token')
          .expect(404, { error: { message: `Article doesn't exists` } });
      });
    });
  });
  describe('POST /api/bookmarks', () => {
    it('POST /api/bookmarks/ create a new bookmark and return it', () => {
      return supertest(app)
        .post('/api/bookmarks/')
        .set('Authorization', 'bearer my-token')
        .send({
          url: 'https://www.npmjs.com/package/supertest',
          title: 'Supertest',
          description: 'supertest documentation',
          rating: 4
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.include({
            url: 'https://www.npmjs.com/package/supertest',
            title: 'Supertest',
            description: 'supertest documentation',
            rating: 4
          });
        });
    });
    it(`POST /api/bookmarks returns 400 'Invalid data' when invalid url`, () => {
      const bookmark = {
        url: 'google',
        title: 'search engine'
      };
      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', 'bearer my-token')
        .send(bookmark)
        .expect(400, 'Invalid data');
    });
    it(`returns 400 'invalid data' if rating is not a number`, () => {
      const bookmark = {
        url: 'http://google.com',
        title: 'search engine',
        rating: 'val'
      };
      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', 'bearer my-token')
        .send(bookmark)
        .expect(400, 'Invalid data');
    });

    it(`returns 400 'invalid data' if rating is not a number between 0-5`, () => {
      const bookmark = {
        url: 'http://google.com',
        title: 'search engine',
        rating: '7'
      };
      return supertest(app)
        .post('/api/bookmarks')
        .set('Authorization', 'bearer my-token')
        .send(bookmark)
        .expect(400, 'Invalid data');
    });
    describe('POST /api/bookmarks error messaje if required values are nor included', () => {
      const requiredValues = [
        {
          require: 'title',
          params: {
            url: 'https://mochajs.org/#assertions',
            description: 'Mocha documentation'
          }
        },
        {
          require: 'url',
          params: { title: 'mocha', description: 'Mocha documentation' }
        },
        {
          require: 'title or/and url',
          params: { description: 'Mocha documentation' }
        }
      ];
      requiredValues.forEach((vals) => {
        it(`POST /api/bookmarks should return error if there is not '${vals.require}'`, () => {
          return supertest(app)
            .post('/api/bookmarks/')
            .set('Authorization', 'bearer my-token')
            .send(vals.params)
            .expect(400, 'Invalid data');
        });
      });
    });
  });
  describe('DELETE /api/bookmarks/:id', () => {
    beforeEach('insert data into bookmarks', () =>
      db('bookmarks').insert(bookmarks)
    );
    it('DELETE /api/bookmarks/:id should work properly', () => {
      return supertest(app)
        .delete('/api/bookmarks/1')
        .set('Authorization', 'bearer my-token')
        .expect(204);
    });
    it(`DELETE /api/bookmarks/:id returns 404 when 'Id is invalid`, () => {
      return supertest(app)
        .delete('/api/bookmarks/89')
        .set('Authorization', 'bearer my-token')
        .expect(404, { error: { message: 'Not found' } });
    });
  });
  describe('PATCH /api/bookmarks/:id', () => {
    context('Given bookmarks has no data', () => {
      it(` returns 404 when bookmark doest exists`, () => {
        return supertest(app)
          .patch('/api/bookmarks/10')
          .set('Authorization', 'bearer my-token')
          .expect(404, { error: { message: `Bookmark doesn't exists` } });
      });
    });
    context('Given bookmarks has data ', () => {
      beforeEach('insert bookmarks', () => db('bookmarks').insert(bookmarks));
      it(`returns 400 when no values are supplied for any fields`, () => {
        return supertest(app)
          .patch('/api/bookmarks/1')
          .set('Authorization', 'bearer my-token')
          .expect(400, { error: { message: 'Invalid data' } });
      });

      it(`returns 204 and update bookmark`, () => {
        const updated = {
          title: 'other google',
          url: 'https://www.yahoo.com'
        };
        const expectedBookmark = {
          ...bookmarks[0],
          ...updated
        };
        return supertest(app)
          .patch('/api/bookmarks/1')
          .set('Authorization', 'bearer my-token')
          .send(updated)
          .expect(204)
          .then(() =>
            supertest(app)
              .get('/api/bookmarks/1')
              .set('Authorization', 'bearer my-token')
              .expect(200)
              .then((res) => {
                expect(res.body).to.eql(expectedBookmark);
              })
          );
      });
    });
  });
});
