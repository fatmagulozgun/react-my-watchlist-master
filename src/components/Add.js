import React, { useEffect, useRef, useState } from "react";
import ResultCart from "./ResultCart";

const Add = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    // Component kapanırken debounce timer'ını temizle.
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  function onChange(e) {
    const nextQuery = e.target.value;
    setQuery(nextQuery);

    // Önceki aramayı iptal edelim (debounce).
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      setError("");
      return;
    }

    if (!process.env.REACT_APP_TMDB_KEY) {
      // CRA'da env vars build/start anında okunur. Anahtar yoksa API 401 döner.
      console.error(
        "REACT_APP_TMDB_KEY tanımsız. .env içine TMDB API key ekleyip yeniden başlatın."
      );
      setResults([]);
      setIsLoading(false);
      setError("TMDB API anahtarı eksik. .env dosyanızı kontrol edin.");
      return;
    }

    const tmdbKey = process.env.REACT_APP_TMDB_KEY;
    // TMDB "Access Token" (JWT) genelde `eyJ...` ile başlar. Bu durumda `Authorization: Bearer ...`
    // kullanıp URL'den `api_key` parametresini çıkarmamız gerekir.
    const isBearerToken = typeof tmdbKey === "string" && tmdbKey.startsWith("eyJ");
    const cacheKey = trimmedQuery;
    const cached = cacheRef.current.get(cacheKey);

    setError("");
    setIsLoading(true);
    setResults([]);

    if (cached) {
      setResults(cached);
      setIsLoading(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const encodedQuery = encodeURIComponent(trimmedQuery);

      // Yeni arama başlayınca önceki fetch'i iptal edelim (race condition önleme).
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const url = isBearerToken
        ? `https://api.themoviedb.org/3/search/movie?language=en-US&page=1&include_adult=false&query=${encodedQuery}`
        : `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&language=en-US&page=1&include_adult=false&query=${encodedQuery}`;

      const options = isBearerToken
        ? {
            headers: {
              Authorization: `Bearer ${tmdbKey}`,
            },
            signal: controller.signal,
          }
        : { signal: controller.signal };

      fetch(url, options)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            if (res.status === 401) {
              console.error("TMDB 401 Unauthorized: API key hatalı ya da eksik.");
            } else {
              console.error(`TMDB ${res.status}: istek başarısız.`);
            }
            setResults([]);
            setError(
              res.status === 401
                ? "TMDB kimlik doğrulaması başarısız (401). API anahtarını kontrol edin."
                : "TMDB'den sonuç alınamadı."
            );
            return;
          }

          // TMDB bazı durumlarda `results` alanını dönmeyebilir.
          const safeResults = Array.isArray(data?.results) ? data.results : [];
          const nextResults = data?.errors ? [] : safeResults;
          setResults(nextResults);

          // Cache'e de koyalım (hata yoksa).
          if (!data?.errors && Array.isArray(safeResults)) {
            cacheRef.current.set(cacheKey, safeResults);
          }
        })
        .catch((err) => {
          // İptal kaynaklı hatayı sessizce geçelim.
          if (err?.name === "AbortError") return;
          setResults([]);
          setError("Ağ hatası oluştu. Lütfen tekrar deneyin.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 400);
  }

  const trimmedQuery = query.trim();

  return (
    <div className="add-page">
      <div className="container">
        <div className="add-content">
          <img
            src="https://www.themoviedb.org/t/p/w1920_and_h600_multi_faces_filter(duotone,032541,01b4e4)/9ZyAUZrfccsjtDwYgc7yvOBnqM9.jpg"
            alt=""
          />
          <div className="titles">
            <h1>Hoş Geldiniz.</h1>
            <h2>
              Milyonlarca film, TV şovu ve keşfedilecek kişi. Şimdi keşfedin.
            </h2>
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              value={query}
              onChange={onChange}
              placeholder="Film, dizi, kişi ara..."
            />
          </div>

          {isLoading && <p className="search-status">Aranıyor...</p>}

          {results.length > 0 && (
            <ul className="results">
              {results.map((movie) => (
                <li key={movie.id}>
                  <ResultCart movie={movie} />
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && trimmedQuery && results.length === 0 && (
            <p className="search-status">Sonuç bulunamadı.</p>
          )}

          {error && <p className="search-error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Add;
