import axios from "axios";
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [book, setBook] = useState("");
  const [result, setResult] = useState([]);
  const [apiKey] = useState("AIzaSyCowm7uPZ2dKZqs5k6vpqnltenXODQiwtM");
  const [bookCount, setBookCount] = useState("");
  const [order, setOrder] = useState("relevance");
  const [categories, setCategories] = useState("");
  const [load, setLoad] = useState(0);
  const [bookPage, setBookPage] = useState("");

  function handleChange(event) {
    const book = event.target.value;

    setBook(book);
  }

  function handleChangeOrder(event) {
    const order = event.target.value;

    setOrder(order);
  }

  function handleChangeCategories(event) {
    const categories = event.target.value;

    setCategories(categories);
  }

  function handleLoadMore(event) {
    event.preventDefault();
    setLoad(load);
    let count = parseInt(load, 10) + 30;
    setLoad(count);

    axios
      .get(
        "https://www.googleapis.com/books/v1/volumes?q=" +
          book +
          categories +
          "&printType=books&orderBy=" +
          order +
          "&maxResults=30&startIndex=" +
          (parseInt(load, 10) + 30) +
          "&key=" +
          apiKey
      )
      .then((data) => {
        setResult(result.concat(data.data.items));
      });
  }

  function handleBookPage(bookP) {
    const bookPage = bookP;

    setBookPage(bookPage);
    console.log(bookPage);
  }

  function handleSubmit(event) {
    event.preventDefault();

    axios
      .get(
        "https://www.googleapis.com/books/v1/volumes?q=" +
          book +
          categories +
          "&printType=books&orderBy=" +
          order +
          "&maxResults=30&key=" +
          apiKey
      )
      .then((data) => {
        setResult(data.data.items);
        setBookCount(data.data.totalItems);
      });
  }

  return (
    <div className="container">
      <h1>Введите название книги</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            onChange={handleChange}
            className="form-control"
            placeholder="Введите название книги"
            autoCapitalize="off"
          />
          <select onChange={handleChangeOrder} defaultValue="relevance">
            <option value="relevance">relevance</option>
            <option value="newest">newest</option>
          </select>
          <select onChange={handleChangeCategories} defaultValue="">
            <option value="">all</option>
            <option value="+subject:art">art</option>
            <option value="+subject:biography">biography</option>
            <option value="+subject:computers">computers</option>
            <option value="+subject:history">history</option>
            <option value="+subject:medical">medical</option>
            <option value="+subject:poetry">poetry</option>
          </select>
          <button type="submit" className="btn btn-danger">
            Поиск
          </button>
        </div>
      </form>
      {result === undefined ? (
        "Ничего не найдено"
      ) : (
        <form onSubmit={handleLoadMore}>
          {bookCount > 0 ? <p>Найдено {bookCount} книг(и)</p> : ""}

          {result.map((book) => (
            <div className="container row">
              <img
                src={
                  book.volumeInfo.imageLinks === undefined
                    ? "https://yugcleaning.ru/wp-content/themes/consultix/images/no-image-found-360x250.png"
                    : `${book.volumeInfo.imageLinks.thumbnail}`
                }
                alt={book.volumeInfo.title}
                className="col-sm-2"
              />
              <a
                href={book.volumeInfo.title}
                onClick={(e) => {
                  e.preventDefault();
                  handleBookPage(book.volumeInfo);
                }}
                className="col-sm-10 h3"
              >
                {book.volumeInfo.title}
              </a>
              <h5 className="col-sm-10 h5">{book.volumeInfo.authors}</h5>
              <h6 className="col-sm-10 h6">{book.volumeInfo.categories}</h6>
            </div>
          ))}

          {bookCount > 0 ? (
            <button type="submit" className="btn btn-danger">
              Загрузить ещё
            </button>
          ) : (
            ""
          )}
        </form>
      )}
    </div>
  );
}
