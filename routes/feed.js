const express = require("express");
const { body, checkSchema } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth = require('../middleware/isAuth')

const router = express.Router();

// GET /feed/books
router.get("/books", isAuth, feedController.getBooks);

router.get("/own_books", isAuth, feedController.getOwnBooks);

router.post(
  "/book", isAuth,
  [
    body("book.title").trim().isLength({ min: 1 }),
    body("book.author").trim().isLength({ min: 1 }),
  ],
  checkSchema({
    book: {

    }
  }),
  feedController.postBook
);

router.get("/book/:bookId", isAuth, feedController.getBook);

router.get('/specific/:bookId', isAuth, feedController.getSpecific);

router.put(
  "/book/:bookId", isAuth,
  [
    body("book.title").trim().isLength({ min: 1 }),
    body("book.author").trim().isLength({ min: 1 }),
  ],
  feedController.updateBook
);

router.delete("/book/:bookId", isAuth, feedController.deleteBook);

module.exports = router;
