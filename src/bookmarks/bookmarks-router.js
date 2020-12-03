const express = require('express');
const logger = require('../logger');
const { v4: uuid } = require('uuid');
const bookmarks = require('../store');

const bookmarksRouter = express.Router();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post((req, res) => {
    const id = uuid();
    const { url, title, description, rating } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res.status(400).send('Invalid data');
    }
    if (!url) {
      logger.error('Url is required');
      return res.status(400).send('Invalid data');
    }
    const bookmark = {
      id,
      url,
      title,
      description,
      rating: parseInt(rating)
    };
    bookmarks.push(bookmark);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    let result = [...bookmarks];
    result = result.find((result) => result.id === id);

    if (!result) {
      logger.error(`The ID is not valid`);
      return res.status(404).send('Not found');
    }
    return res.json(result);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      res.status(404).send('Not found');
    }
    bookmarks.splice(bookmarkIndex, 1);
    return res.location(`http://localhost:8000/bookmarks/`).json(bookmarks);
  });

module.exports = bookmarksRouter;