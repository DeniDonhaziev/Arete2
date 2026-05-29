import styles from "../scss/components/brandTitle.module.scss";

/**
 * Логотип «Arête» — курсивный serif как на фирменном знаке.
 * @param {"hero"|"display"|"header"|"footer"|"inline"} size
 */
const BrandTitle = ({ size = "display", className = "", as: Tag = "span" }) => (
  <Tag
    className={[styles.brand, styles[size], className].filter(Boolean).join(" ")}
    aria-label="Arête"
  >
    Ar&ecirc;te
  </Tag>
);

export default BrandTitle;
