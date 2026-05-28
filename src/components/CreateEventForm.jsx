import { useState } from "react";
import { useApi } from "../hooks/useApi";
import styles from "../scss/components/createEventForm.module.scss"

const CreateEventForm = ({ onSuccess }) => {
  const { apiCall } = useApi();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plannedAt, setPlannedAt] = useState("");


  const submit = async (e) => {
    e.preventDefault();

    await apiCall("/events", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        plannedAt,
      }),
    });

    setTitle("");
    setDescription("");
    setPlannedAt("");
    onSuccess();
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <h3 className={styles.title}>Новое мероприятие</h3>

      <input
      className={styles.input}
        placeholder="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
      className={styles.textarea}
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
      className={styles.input}
        type="datetime-local"
        value={plannedAt}
        onChange={(e) => setPlannedAt(e.target.value)}
        required
      />

      <button className={styles.button}>Создать</button>
    </form>
  );
};

export default CreateEventForm;
