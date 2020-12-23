const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const bookmarks = require('../src/store');

describe('Bookmarks endpoint', () => {
  it('GET /bookmarks/ returns all bookmarks in proper format ', () => {
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
  it('GET /bookmarks/:id returns bookmark with specific ID', () => {
    return supertest(app)
      .get('/bookmarks/8sdfbvbs65sd')
      .set('Authorization', 'bearer my-token')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.deep.include({ id: '8sdfbvbs65sd' });
      });
  });
  it('GET /bookmarks/:id returns 404 Not found if ID no valid', () => {
    return supertest(app)
      .get('/bookmarks/999392')
      .set('Authorization', 'bearer my-token')
      .expect(404, 'Not found');
  });

  it('POST /bookmarks/ create a new bookmark and return it', () => {
    return supertest(app)
      .post('/bookmarks')
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
  it(`POST /bookmarks returns 400 'Invalid data' when invalid url`, () => {
    const bookmark = {
      url: 'google',
      title: 'search engine'
    };
    return supertest(app)
      .post('/bookmarks')
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
      .post('/bookmarks')
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
      .post('/bookmarks')
      .set('Authorization', 'bearer my-token')
      .send(bookmark)
      .expect(400, 'Invalid data');
  });
  describe('POST /bookmarks error messaje if required values are nor included', () => {
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
      it(`POST /bookmarks should return error if there is not '${vals.require}'`, () => {
        return supertest(app)
          .post('/bookmarks')
          .set('Authorization', 'bearer my-token')
          .send(vals.params)
          .expect(400, 'Invalid data');
      });
    });
  });
  it('DELETE /bookmarks/:id should work properly', () => {
    return supertest(app)
      .delete('/bookmarks/8sdfbvbs65sd')
      .set('Authorization', 'bearer my-token')
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body).not.to.deep.includes({ id: '8sdfbvbs65sd' });
      });
  });
  it(`DELETE /bookmarks/:id returns 404 when 'Id is invalid`, () => {
    return supertest(app)
      .delete('/bookmarks/kdjsjdsjjdjs')
      .set('Authorization', 'bearer my-token')
      .expect(404, 'Not found');
  });
});
