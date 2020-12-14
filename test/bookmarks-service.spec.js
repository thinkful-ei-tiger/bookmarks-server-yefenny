const BookmarksService = require('../src/bookmarks/bookmarks-service');
const knex = require('knex');
const { makeBookmarks } = require('./bookmarks.fixtures');
const { expect } = require('chai');

describe('Bookmark service', () => {
  let db;
  const bookmarks = makeBookmarks();
  before('connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
  });
  before('Clean table', () => db('bookmarks').truncate());
  afterEach('Clean table to not repeat ID unique values', () =>
    db('bookmarks').truncate()
  );
  after(() => db.destroy());
  context(`Given 'bookmarks' has  data`, () => {
    beforeEach('insert data into bookmarks', () =>
      db.into('bookmarks').insert(bookmarks)
    );
    it('getAllBookmarks() return all bookmarks', () => {
      return BookmarksService.getAllBookmarks(db).then((actual) => {
        expect(actual).to.eql(bookmarks);
      });
    });
    it('getBookmarkById() return the bookmark with the id sent', () => {
      const id = 2;
      const expected = bookmarks.find((bk) => bk.id === id);
      return BookmarksService.getBookmarkById(db, id).then((actual) => {
        expect(actual).to.eql(expected);
      });
    });
    it('deleteBookmark() return bookmarks without the one deleted', () => {
      const id = 2;
      const expected = bookmarks.filter((bk) => bk.id !== id);

      return BookmarksService.deleteBookmark(db, id).then(() =>
        BookmarksService.getAllBookmarks(db).then((actual) => {
          expect(actual).to.eql(expected);
        })
      );
    });
    it('updateBookmark() updates and returns updated bookmark', () => {
      const id = 1;
      const expectedBkmk = bookmarks.find((bk) => bk.id === id);

      const updt = {
        title: 'Google'
      };

      return BookmarksService.updateBookmark(db, id, updt).then(() => {
        BookmarksService.getBookmarkById(db, id).then((actual) => {
          expect(actual).to.eql({ ...expectedBkmk, ...updt });
        });
      });
    });
  });
  context(`Given 'bookmarks' has not data`, () => {
    it('getAllBokkmarks() resolves an empty array', () => {
      return BookmarksService.getAllBookmarks(db).then((actual) => {
        expect(actual).to.eql([]);
      });
    });
    it('insertBookmark() creates and returns bookmark', () => {
      const newBookmark = {
        id: 1,
        title: 'Google 1',
        url: 'https://www.google.com',
        description: 'A search Engine',
        rating: 3
      };
      return BookmarksService.insertBookmark(db, newBookmark).then((actual) => {
        expect(actual).to.eql(newBookmark);
      });
    });
  });
});
