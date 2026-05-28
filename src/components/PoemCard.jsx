import styles from "../scss/components/poemCard.module.scss";
import { useSliderPoem } from "../API/UseSliderLogic";
import { useTheme } from "../store/useTheme";
import { formatDateRu } from "../utils/date";
import { useEffect } from "react";

const PoemCard = () => {
  const { theme } = useTheme();
  const { 
    slaiderPoem, 
    neumbersPoem, 
    setPoemPlus, 
    setPoemMinus, 
    fetchSliderPoem, 
    loading, 
    error 
  } = useSliderPoem();
  
  const currentSlide = slaiderPoem[neumbersPoem];

  useEffect(() => {
    fetchSliderPoem();
  }, [fetchSliderPoem]);

  // Защита от ошибок при отсутствии данных
  if (!currentSlide) {
    return (
      <div className={styles.visualBackdrop}>
        {loading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>
          {typeof error === 'string' ? error : error?.message || 'Ошибка загрузки'}
        </p>}
        {!loading && !error && (
          <p style={{ textAlign: "center", color: "#999" }}>
            Пока нет одобренных стихов. Отправьте свой в профиле — после модерации он
            появится здесь.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.visualBackdrop}>

      {loading && <p style={{ textAlign: "center" }}>Загрузка...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>
        {typeof error === 'string' ? error : error?.message || 'Ошибка загрузки'}
      </p>}

      <nav 
        className={theme === 'black' ? styles.leftArrow : `${styles.leftArrow} ${styles.arrowColor}`} 
        onClick={setPoemMinus}
      >
        <button aria-label="Предыдущий">‹</button>
      </nav>
      
      <div>
        <div className={theme === 'black' ? styles.card : `${styles.card} ${styles.cardColor}`}>
          <div className={styles.cardHeader}>
            <span className={`${styles.cardType} ${styles.monstratStyls300}`}>
              Стих
            </span>
            <span className={`${styles.cardAuthor} ${styles.monstratStyls300}`}>
              {currentSlide.author?.firstName} {currentSlide.author?.lastName}
            </span>
          </div>
          
          <div className={styles.cardBody}>
            {/* Заголовок стиха */}
            <div className={styles.titleLine}>
              {currentSlide.title}
            </div>
            
            {/* Текст стиха (без первой строки) */}
            <pre className={theme === 'black' ? styles.cardContent : `${styles.cardContent} ${styles.cardContentColor}`}>
              {currentSlide.description?.replace(/^.*\n/, "")}
            </pre>
          </div>
          
          <div className={styles.cardFooter}>
            <span className={styles.date}>
              {formatDateRu(currentSlide?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <nav 
        className={theme === 'black' ? styles.rightArrow : `${styles.rightArrow} ${styles.arrowColor}`} 
        onClick={setPoemPlus}
      >
        <button aria-label="Следующий">›</button>
      </nav>

    </div>
  );
};

export default PoemCard;