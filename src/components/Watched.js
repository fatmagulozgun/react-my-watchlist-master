import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import MovieCard from "./MovieCard";

const Watched = () => {
  const { watched, clearWatched } = useContext(GlobalContext);
  return (
    <div className="movie-page">
      <div className="container">
        <div className="header">
          <h1 className="heading">İzlenen Filmler</h1>
          <div className="header-actions">
            <div className="count-pill">
              {watched.length} {watched.length < 2 ? "Film" : "Filmler"}
            </div>
            <button
              className="clear-btn"
              disabled={watched.length === 0}
              onClick={() => {
                if (
                  window.confirm(
                    "İzlenenler listenizi temizlemek istiyor musunuz?"
                  )
                ) {
                  clearWatched();
                }
              }}
            >
              İzlenenleri Temizle
            </button>
          </div>
        </div>

        {watched.length > 0 ? (
          <div className="movie-grid">
            {watched.map((movie) => (
              <MovieCard movie={movie} key={movie.id} type="watched" />
            ))}
          </div>
        ) : (
          <h2 className="no-movies">Listenizde Film Yok...</h2>
        )}
      </div>
    </div>
  );
};

export default Watched;
