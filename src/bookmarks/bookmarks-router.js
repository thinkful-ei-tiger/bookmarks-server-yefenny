const express = require('express');
const logger = require('../logger');
const BookmarksService = require('./bookmarks-service');
const validUrl = require('valid-url');

const bookmarksRouter = express.Router();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexinstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexinstance)
      .then((bookmarks) => {
        res.json(bookmarks);
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const { url, title, description, rating } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res.status(400).send('Invalid data');
    }
    if (!url) {
      logger.error('Url is required');
      return res.status(400).send('Invalid data');
    }
    if (!validUrl.isUri(url)) {
      logger.error('URL format is invalid');
      return res.status(400).send('Invalid data');
    }
    if (
      rating &&
      (isNaN(rating) || ![1, 2, 3, 4, 5].includes(parseInt(rating)))
    ) {
      logger.error('Rating is not a number');
      return res.status(400).send('Invalid data');
    }
    const bookmark = {
      url,
      title
    };

    if (description) bookmark.description = description;
    if (rating) bookmark.rating = parseInt(rating);

    BookmarksService.insertBookmark(req.app.get('db'), bookmark)
      .then((bookmark) => {
        if (bookmark) {
          res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark);
        }
      })
      .catch(next);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
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
  })
  .delete((req, res, next) => {
    const { id } = req.params;

    BookmarksService.getBookmarkById(req.app.get('db'), id)
      .then((bookmark) => {
        if (!bookmark) {
          return res.status(404).json({ error: { message: 'Not found' } });
        }
      })
      .catch(next);

    BookmarksService.deleteBookmark(req.app.get('db'), id)
      .then((bookmarks) => {
        return res.location(`http://localhost:8000/bookmarks/`).json(bookmarks);
      })
      .catch(next);
  });

module.exports = bookmarksRouter;
