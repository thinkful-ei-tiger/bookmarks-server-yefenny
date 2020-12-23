const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },
  getBookmarkById(knex, id) {
    return knex('bookmarks').select('*').where('id', id).first();
  },
  deleteBookmark(knex, id) {
    return knex('bookmarks').where('id', id).delete().returning('*');
  },
  insertBookmark(knex, bookmark) {
    return knex('bookmarks')
      .insert(bookmark)
      .returning('*')
      .then((row) => {
        return row[0];
      });
  },
  updateBookmark(knex, id, toUpdate) {
    return knex('bookmarks').where('id', id).update(toUpdate);
  }
};

module.exports = BookmarksService;
