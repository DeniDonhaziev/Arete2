import React, { useState } from "react";
import {NavLink , useNavigate } from "react-router-dom"
import styles from "../scss/pages/singUp.module.scss";
import { useTheme } from "../store/useTheme";

export default function SingUp() {
  const { theme } = useTheme();
  const [step, setStep] = useState(0); // 0..4
  const navigate = useNavigate(); 

  const titles = [
    "Основная информация",
    "Контакты для связи",
    "Род деятельности",
    "О себе",
    "Род деятельности",
  ];
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className={theme === 'black' ? styles.container : `${styles.container} ${styles.containerColor}`}>
      {/* Верхняя панель с системной кнопкой назад */}
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={back} aria-label="Назад">
          {/* <NavLink to="/"> */}
          <img src={theme === 'black' ? "/img/back.svg" : "/img/backBleack.svg"} alt="back" onClick={()=>navigate(-1)} />
          {/* </NavLink> */}
        </button>
      </header>

      {/* Прокручиваемая область контента */}
      <div className={styles.contentScroll}>
        <div className={styles.logo}>
          <NavLink to="/"><img src={theme === 'black' ? "/img/logo.svg" : "/img/logo-bleack.svg"} alt="Logo" /></NavLink>
          <h1 className={styles.title}>
            Анкета <br />
            <span>для регистрации</span>
          </h1>
        </div>

        {/* Степпер */}
        <div className={styles.progress}>
          <span className={styles.progressTitle}>{titles[step]}</span>
          <div className={styles.progressBar}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`${styles.progressStep} ${i <= step ? styles.active : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Шаги (только поля, без кнопок) */}
        <div className={styles.steps}>
          {/* Шаг 1 */}
          <form className={`${styles.form} ${step === 0 ? styles.isActive : ""}`}>
            <input type="text" placeholder="ФИО" className={styles.input} />
            <input type="date" placeholder="Дата рождения" className={styles.input} />
            <input type="text" placeholder="Город проживания" className={styles.input} />
          </form>

          {/* Шаг 2 */}
          <form className={`${styles.form} ${step === 1 ? styles.isActive : ""}`}>
            <input type="email" placeholder="E-mail" className={styles.input} />
            <input type="tel" placeholder="Телефон (WhatsApp)" className={styles.input} />
            <input type="text" placeholder="Telegram" className={styles.input} />
            <input type="text" placeholder="Instagram (при наличии)" className={styles.input} />
          </form>

          {/* Шаг 3 */}
          <form className={`${styles.form} ${step === 2 ? styles.isActive : ""}`}>
            <input type="text" placeholder="Место работы / Учебное заведение" className={styles.input} />
            <input type="text" placeholder="Должность / Специальность" className={styles.input} />
            <input type="text" placeholder="Курс и форма обучения (если студент)" className={styles.input} />
            <input type="text" placeholder="Класс (если школа)" className={styles.input} />
          </form>

          {/* Шаг 4 — О себе */}
          <form className={`${styles.form} ${step === 3 ? styles.isActive : ""}`}>
            <input type="text" placeholder="Национальность" className={styles.input} />
            <textarea placeholder="Ключевые навыки и сильные стороны (без скромности)" className={styles.textarea} rows={3} />
            <textarea placeholder="Интересы и увлечения" className={styles.textarea} rows={3} />
          </form>

          {/* Шаг 5 — Интересы/медиа */}
          <form className={`${styles.form} ${step === 4 ? styles.isActive : ""}`}>
            <textarea placeholder="Любимые книги, фильмы, сериалы (можно кратко пояснить выбор)" className={styles.textarea} rows={3} />
            <textarea placeholder="Любимые жанры и почему именно они" className={styles.textarea} rows={3} />
          </form>
        </div>
      </div>

      {/* Футер с кнопками — всегда у нижнего края, всегда вертикально */}
      <div className={styles.footerActions}>
                <button
          type="button"
          className={styles.submitButton}
          onClick={next}
        >
          Далее
        </button>
        
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={back}
          disabled={step === 0}
        >
          Назад
        </button>


      </div>
    </div>
  );
}