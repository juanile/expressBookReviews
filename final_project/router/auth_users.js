const express = require('express');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {

    return username.length >= 3;
}

const authenticatedUser = (username, password) => {

    const registeredUser = users.find(user => user.username === username && user.password === password);
    return !!registeredUser; // Devuelve true si el usuario está autenticado, de lo contrario, devuelve false
}






// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Verificar si se proporcionó una reseña
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Verificar si el libro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Añadir la reseña al libro
    books[isbn].reviews.push(review);

    return res.status(200).json({ message: "Review added successfully", book: books[isbn] });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
