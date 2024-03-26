const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Configurar express-session
public_users.use(session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true
}));


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Verificar si se proporcionaron nombre de usuario y contraseña
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Verificar si el nombre de usuario ya existe
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Agregar el nuevo usuario
    users.push({ username, password });

    return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Login for registered users
public_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Verificar si se proporcionaron nombre de usuario y contraseña
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Verificar si el usuario existe y las credenciales son válidas
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generar token JWT
    const token = jwt.sign({ username }, "secretkey");

    // Guardar el token en la sesión
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ message: "Customer successfully logged in" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])
    });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const authorBooks = Object.values(books).filter(book => book.author === author);

    if (authorBooks.length > 0) {
        res.json(authorBooks);
    } else {
        res.status(404).json({ message: "Books not found for author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const titleBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

    if (titleBooks.length > 0) {
        res.json(titleBooks);
    } else {
        res.status(404).json({ message: "Books not found for title" });
    }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    const book = books[isbn];

    if (book && book.reviews) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: "Reviews not found for book" });
    }
});

// Add a book review
public_users.put("/auth/review/:isbn", (req, res) => {
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

// Delete a book review
public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Verificar si el libro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verificar si hay reviews para el libro
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for the book" });
    }

    // Eliminar la review del libro
    books[isbn].reviews = {};

    return res.status(200).json({ message: "Review deleted successfully", book: books[isbn] });
});

// Obtener la lista de libros usando async-await y Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('https://juanile97-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/');
        res.send(JSON.stringify(response.data,null,4));
    } catch (error) {
        console.error('Error fetching books: ', error);
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Obtener los detalles del libro usando ISBN con async-await y Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`https://juanile97-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/${isbn}`);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching book details: ', error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// Obtener los libros basados en el autor con async-await y Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`https://juanile97-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/?author=${author}`);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching book details: ', error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});

// Obtener los libros basados en el título con async-await y Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(`https://juanile97-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title=${title}`);
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching book details: ', error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});







module.exports.general = public_users;
