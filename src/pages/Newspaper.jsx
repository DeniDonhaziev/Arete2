import { useEffect, useState, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Search from "../components/Search";
import styles from "../scss/pages/newspaper.module.scss";
import stylesPoem from "../scss/components/poemCard.module.scss";
import { useTheme } from "../store/useTheme";
import { useApi } from "../hooks/useApi";
import { formatDateRu } from "../utils/date";

const Newspaper = () => {
  const { theme } = useTheme();
  const { apiCall } = useApi();

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall("/posts");
      setPosts(data);
    } catch (err) {
      setError(err.message || "Ошибка загрузки стихов");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const lower = searchQuery.toLowerCase();

    return posts.filter((post) => {
      const author = post.author || {};
      return (
        (post.title || "").toLowerCase().includes(lower) ||
        (post.description || "").toLowerCase().includes(lower) ||
        (author.firstName || "").toLowerCase().includes(lower) ||
        (author.lastName || "").toLowerCase().includes(lower)
      );
    });
  }, [posts, searchQuery]);

  return (
    <>
      <Header />

      <div
        className={
          theme === "black"
            ? styles.container
            : `${styles.container} ${styles.containerColor}`
        }
      >
        <h1 className={styles.title}>Газета</h1>

        {/* 🔎 Live Search */}
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {loading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            В газете пока нет стихов. После одобрения администратором они появятся
            здесь.
          </p>
        )}

        {!loading && posts.length > 0 && filteredPosts.length === 0 && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            По вашему запросу ничего не найдено
          </p>
        )}

        <div
          className={styles.cards}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={
                theme === "black"
                  ? stylesPoem.card
                  : `${stylesPoem.card} ${stylesPoem.cardColor}`
              }
            >
              <div className={stylesPoem.cardHeader}>
                <span className={stylesPoem.cardType}>Стих</span>
                <span className={stylesPoem.cardAuthor}>
                  {post.author?.firstName} {post.author?.lastName}
                </span>
              </div>

              <div className={stylesPoem.cardBody}>
                <div className={`${stylesPoem.titleLine} ${stylesPoem.noClamp}`}>{post.title}</div>
                <pre className={`${stylesPoem.cardContent} ${stylesPoem.noClamp}`}>
                  {post.description}
                </pre>
              </div>

              <div className={stylesPoem.cardFooter}>
                <span className={stylesPoem.date}>
                  {formatDateRu(post.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Newspaper;
