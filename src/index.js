import ReactDOM from "react-dom";
import { computed, extendObservable } from "mobx";
import { observer } from "mobx-react";
import { Component } from "react";
import "./styles.css";

const query = new (class UserQuery {
  constructor() {
    extendObservable(this, {
      request: "",
      order: "relevance",
      categorie: "",
      APIKey: "AIzaSyCowm7uPZ2dKZqs5k6vpqnltenXODQiwtM",
      responce: "",
      data: [],
      bookPage: "",
      startIndex: 0,
      totalCount: 0
    });
  }

  @computed get query() {
    return `${this.request}` === ""
      ? ((this.data = []), (this.responce = ""), (this.totalCount = 0))
      : ` https://www.googleapis.com/books/v1/volumes?q=${this.request}${this.categorie}&printType=books&orderBy=${this.order}&maxResults=30&startIndex=${this.startIndex}&key=${this.APIKey}`;
  }
})();

query.change = function (event) {
  this.request = event.target.value;
  //console.log(this.request);
};

query.changeCategorie = function (event) {
  event.target.value === "all"
    ? (this.categorie = "")
    : (this.categorie = "+subject:" + event.target.value);
  //console.log(this.categorie);
};

query.changeOrder = function (event) {
  this.order = event.target.value;
  //console.log(this.order);
};

@observer
class Search extends Component {
  handleSearch = (event) => {
    this.props.store.change(event);
  };

  handleCategorie = (event) => {
    this.props.store.changeCategorie(event);
  };

  handleOrder = (event) => {
    this.props.store.changeOrder(event);
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.props.store.startIndex = 0;
    this.props.store.bookPage = "";
    const response = await fetch(this.props.store.query, { method: "GET" });
    this.props.store.responce = await response.json();
    this.props.store.totalCount = this.props.store.responce.totalItems;
    this.props.store.data = this.props.store.responce.items;
  };

  handleLoadMore = async (event) => {
    if (this.props.store.startIndex + 30 <= this.props.store.totalCount) {
      this.props.store.startIndex += 30;
      const response = await fetch(this.props.store.query, { method: "GET" });
      this.props.store.responce = await response.json();
      this.props.store.data = this.props.store.data.concat(
        this.props.store.responce.items
      );
    }
  };

  render() {
    return (
      <div className="container">
        <div className="container search">
          <h1>Введите название книги</h1>
          <form className="form-group" onSubmit={this.handleSubmit}>
            <div>
              <input
                type="text"
                onChange={this.handleSearch}
                className="form-control"
                placeholder="Введите название книги"
                autoCapitalize="off"
              />
              <select
                className="mt mr col-sm-2 col-xs-2 col-md-2 col-lg-2 col-xl-2"
                onChange={this.handleOrder}
                defaultValue="relevance"
              >
                <option value="relevance">relevance</option>
                <option value="newest">newest</option>
              </select>
              <select
                className="mt mr col-sm-2 col-xs-2 col-md-2 col-lg-2 col-xl-2"
                onChange={this.handleCategorie}
                defaultValue=""
              >
                <option>all</option>
                <option>art</option>
                <option>biography</option>
                <option>computers</option>
                <option>history</option>
                <option>medical</option>
                <option>poetry</option>
              </select>
              <button
                type="submit"
                className="btn btn-danger mt mr col-sm-2 col-xs-2 col-md-2 col-lg-2 col-xl-2"
              >
                Поиск
              </button>
              {this.props.store.totalCount > 0 ? (
                <p className="counter mt float-right col-sm-2 col-xs-2 col-md-2 col-lg-2 col-xl-2">
                  Найдено {this.props.store.totalCount} книг(и/а)
                </p>
              ) : (
                ""
              )}
            </div>
          </form>
        </div>
        {this.props.store.responce === "" ? (
          ""
        ) : this.props.store.data === undefined &&
          this.props.store.responce !== "" ? (
          <h3>Ничего не найдено</h3>
        ) : (
          <div className="container workarea py">
            {this.props.store.data.map((book) => (
              <div className="container row py">
                <div className="col-sm-2 col-xs-2 col-md-2 col-lg-2 col-xl-2 float-left">
                  <img
                    src={
                      book.volumeInfo.imageLinks === undefined
                        ? ""
                        : `${book.volumeInfo.imageLinks.thumbnail}`
                    }
                    alt={book.volumeInfo.title}
                    className="border"
                  />
                </div>
                <div className="col-sm-10 col-xs-10 col-md-10 col-lg-10 col-xl-10 float-right">
                  <a
                    href={book.volumeInfo.title}
                    className="h3"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.store.bookPage = this.props.store.data;
                      this.props.store.data = this.props.store.data.filter(
                        (item) => {
                          return item.id === book.id;
                        }
                      );
                    }}
                  >
                    {book.volumeInfo.title}
                  </a>
                  <h5 className="h5">{book.volumeInfo.authors}</h5>
                  <h6 className="h6">{book.volumeInfo.categories}</h6>
                </div>
              </div>
            ))}
            {this.props.store.bookPage !== "" ? (
              <button
                className="btn btn-danger mt"
                onClick={(e) => {
                  this.props.store.data = this.props.store.bookPage;
                  this.props.store.bookPage = "";
                }}
              >
                Назад
              </button>
            ) : (
              <button
                className="btn btn-danger mt"
                onClick={this.handleLoadMore}
              >
                Загрузить ещё
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Search store={query} />, rootElement);
