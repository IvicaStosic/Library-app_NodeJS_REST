const Book = require("../models/book");
const User = require('../models/user');

const { validationResult } = require("express-validator");

exports.getBooks = async (req, res, next) => {
  const userId = req.userId
  try {
    const books = await Book.find({
      $or: [
        { creator: userId },
        { private: false }
      ]
    });
    res.status(200).json({
      message: "Fetched books successfully",
      books: books,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode(500);
    }
    next(err);
  }
};

exports.getOwnBooks = async (req, res, next) => {
  const userId = req.userId
  try {
    const books = await Book.find({ creator: userId })
    res.status(200).json({
      message: "Fetched user's books successfully",
      books: books,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
}

exports.postBook = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.book.title;
  const author = req.body.book.author;
  const description = req.body.book.description;
  const private = req.body.book.privacy;
  const book = new Book({
    title: title,
    author: author,
    description: description,
    private: private,
    creator: req.userId
  });
  try {
    await book.save();
    const user = await User.findById(req.userId);
    user.books.push(book)
    await user.save();
    res.status(201).json({
      message: "Book added successfully.",
      book: book,
      creator: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err)
  }
};

exports.getBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("Could not find book");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Book fetched successfully", book: book });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSpecific = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("Could not find book");
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(book.creator);
    if (!user) {
      const error = new Error("Could not find creator");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Book fetched successfully", book: book, creator: user.username });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.book.title;
  const author = req.body.book.author;
  const description = req.body.book.description;
  const private = req.body.book.privacy;
  try {
    let book = await Book.findById(bookId).populate('creator');
    if (!book) {
      const error = new Error("Could not find desired book.");
      error.statusCode = 404;
      throw error;
    }
    if (book.creator._id.toString() !== req.userId) {
      const error = new Error("Not autorized.");
      error.status = 403;
      throw error;
    }
    book.title = title;
    book.author = author;
    book.description = description;
    book.private = private;
    const result = await book.save();
    res
      .status(200)
      .json({ message: "Book added to the library.", book: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      const error = new Error("Could not find desired book.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not autorized.");
      error.status = 403;
      throw error;
    }
    await Book.findByIdAndRemove(bookId);
    const user = await User.findById(req.userId);
    user.books.pull(bookId)
    await user.save()
    res.status(200).json({ message: "Deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
