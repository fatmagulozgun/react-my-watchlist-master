import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import MovieCard from "./MovieCard";

const Watchlist = () => {
  const { watchlist, clearWatchlist } = useContext(GlobalContext);
  return (
    <div className="movie-page">
      <div className="container">
        <div className="header">
          <h1 className="heading">İzlenecek Filmler</h1>
          <div className="header-actions">
            <div className="count-pill">
              {watchlist.length} {watchlist.length < 2 ? "Film" : "Filmler"}
            </div>
            <button
              className="clear-btn"
              disabled={watchlist.length === 0}
              onClick={() => {
                if (
                  window.confirm(
                    "İzlenecek listenizi temizlemek istiyor musunuz?"
                  )
                ) {
                  clearWatchlist();
                }
              }}
            >
              Listeyi Temizle
            </button>
          </div>
        </div>

        {watchlist.length > 0 ? (
          <div className="movie-grid">
            {watchlist.map((movie) => (
              <MovieCard movie={movie} key={movie.id} type="watchlist" />
            ))}
          </div>
        ) : (
          <h2 className="no-movies">Listenizde Film Yok...</h2>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
