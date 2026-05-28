import React from 'react';
import styles from '../../scss/components/adminPanel.module.scss';
import AdminUserCard from '../Admin/AdminUserCard';

const mockUsers = [
  {
    id: 1,
    first_name: 'Иван',
    last_name: 'Иванов',
    rating: 4.8,
    role: 'золотой',
    is_card: true,
    status: 'approved',
    createdAt: '01.06.2025',
  },
  {
    id: 2,
    first_name: 'Анна',
    last_name: 'Петрова',
    rating: 4.2,
    role: 'серебренный',
    is_card: false,
    status: 'pending',
    createdAt: '05.06.2025',
  },
  {
    id: 3,
    first_name: 'Олег',
    last_name: 'Сидоров',
    rating: 3.9,
    role: 'бронзовый',
    is_card: false,
    status: 'approved',
    createdAt: '10.06.2025',
  },
];

const AdminUsers = () => {
  const [filter, setFilter] = React.useState('all');

  const users = mockUsers; // здесь потом подставишь данные с бэка

  const filteredUsers = React.useMemo(() => {
    if (filter === 'gold') {
      return users.filter((u) => (u.role || '').toLowerCase().startsWith('зол'));
    }
    if (filter === 'silver') {
      return users.filter((u) => (u.role || '').toLowerCase().startsWith('сер'));
    }
    if (filter === 'bronze') {
      return users.filter((u) => (u.role || '').toLowerCase().startsWith('брон'));
    }
    if (filter === 'pending') {
      return users.filter((u) => u.status === 'pending');
    }
    return users;
  }, [users, filter]);

  const total = users.length;
  const shown = filteredUsers.length;

  const handleApprove = (id) => {
    console.log('approve user', id);
  };

  const handleReject = (id) => {
    console.log('reject user', id);
  };

  const handleEdit = (id) => {
    console.log('edit user', id);
  };

  const handleDelete = (id) => {
    console.log('delete user', id);
  };

  const handleOpen = (id) => {
    console.log('open user', id);
  };

  const handleChangeRole = (id, newRole) => {
    console.log('change role', id, newRole);
  };

  return (
    <section className={styles.container}>
      <div className={styles.adminBlogs}>
        <div style={{ padding: '10px' }}>
          <h2>Пользователи</h2>

          <div className={styles.filterBar}>
            <button
              type="button"
              className={
                styles.filterBtn +
                ' ' +
                (filter === 'all' ? styles.filterBtnActive : '')
              }
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                ' ' +
                (filter === 'gold' ? styles.filterBtnActive : '')
              }
              onClick={() => setFilter('gold')}
            >
              Золотые
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                ' ' +
                (filter === 'silver' ? styles.filterBtnActive : '')
              }
              onClick={() => setFilter('silver')}
            >
              Серебряные
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                ' ' +
                (filter === 'bronze' ? styles.filterBtnActive : '')
              }
              onClick={() => setFilter('bronze')}
            >
              Бронзовые
            </button>
            <button
              type="button"
              className={
                styles.filterBtn +
                ' ' +
                (filter === 'pending' ? styles.filterBtnActive : '')
              }
              onClick={() => setFilter('pending')}
            >
              Ожидают подтверждения
            </button>

            <span className={styles.filterInfo}>
              Показано {shown} из {total}
            </span>
          </div>
        </div>

        <div className={styles.cardsGrid}>
          {filteredUsers.map((user) => (
            <AdminUserCard
              key={user.id}
              {...user}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={handleOpen}
              onChangeRole={handleChangeRole}
            />
          ))}

          {shown === 0 && (
            <div className={styles.emptyState}>
              По выбранному фильтру пользователей нет.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminUsers;