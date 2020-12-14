const express = require('express');
const logger = require('../logger');
const { v4: uuid } = require('uuid');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();

bookmarksRouter.route('/bookmarks').get((req, res, next) => {
  const knexinstance = req.app.get('db');
  BookmarksService.getAllBookmarks(knexinstance)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});
// .post((req, res) => {
//   const id = uuid();
//   const { url, title, description, rating } = req.body;

//   if (!title) {
//     logger.error('Title is required');
//     return res.status(400).send('Invalid data');
//   }
//   if (!url) {
//     logger.error('Url is required');
//     return res.status(400).send('Invalid data');
//   }
//   const bookmark = {
//     id,
//     url,
//     title,
//     description,
//     rating: parseInt(rating)
//   };
//   bookmarks.push(bookmark);

//   res
//     .status(201)
//     .location(`http://localhost:8000/bookmarks/${id}`)
//     .json(bookmark);
// });

bookmarksRouter.route('/bookmarks/:id').get((req, res, next) => {
  const { id } = req.params;

  BookmarksService.getBookmarkById(req.app.get('db'), id)
    .then((bookmark) => {
      if (!bookmark) {
        return res
          .status(404)
          .json({ error: { message: `Article doesn't exists` } });
      }
      res.json(bookmark);
    })
    .catch(next);
});
//   .delete((req, res) => {
//     const { id } = req.params;
//     const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);

//     if (bookmarkIndex === -1) {
//       logger.error(`Bookmark with id ${id} not found`);
//       res.status(404).send('Not found');
//     }
//     bookmarks.splice(bookmarkIndex, 1);
//     return res.location(`http://localhost:8000/bookmarks/`).json(bookmarks);
//   });

module.exports = bookmarksRouter;
