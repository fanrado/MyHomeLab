import React, { useState, useEffect, useRef } from 'react';
import './TodoApp.css';

const API_BASE = 'http://localhost:5000';

export default function TodoApp({ onClose }) {
  const [todos, setTodos]         = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText]   = useState('');
  const fileInputRef              = useRef(null);

  useEffect(() => { fetchTodos(); }, []);

  // ── API helpers ─────────────────────────────────────────────────────────────

  async function fetchTodos() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/todos`);
      if (!res.ok) throw new Error('Could not load todos — is the backend running?');
      setTodos(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create todo');
      const todo = await res.json();
      setTodos(prev => [todo, ...prev]);
      setInput('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleTodo(todo) {
    try {
      const res = await fetch(`${API_BASE}/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updated = await res.json();
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_BASE}/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  async function saveEdit(id) {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editText.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updated = await res.json();
      setTodos(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setEditingId(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  function exportCSV() {
    window.open(`${API_BASE}/api/todos/export`, '_blank');
  }

  async function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/api/todos/import`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to import CSV');
      await fetchTodos();
    } catch (e) {
      setError(e.message);
    }
    e.target.value = '';
  }

  const remaining = todos.filter(t => !t.completed).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="todo-app">
      <div className="todo-container">

        {onClose && (
          <button
            className="todo-close-btn"
            onClick={onClose}
            aria-label="Close and return to Apps & Hardware"
            title="Close"
          >
            ✕
          </button>
        )}

        <header className="todo-header">
          <h1>📋 To-Do List</h1>
          <p className="todo-subtitle">Tasks are persisted as a CSV file on the server.</p>
        </header>

        {error && (
          <div className="todo-error" role="alert">
            ⚠️ {error}
            <button className="todo-error-close" onClick={() => setError(null)} aria-label="Dismiss">✕</button>
          </div>
        )}

        <form className="todo-form" onSubmit={addTodo}>
          <input
            className="todo-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add a new task…"
            aria-label="New task"
          />
          <button className="todo-add-btn" type="submit">Add</button>
        </form>

        {loading ? (
          <div className="todo-loading">Loading…</div>
        ) : (
          <>
            <ul className="todo-list" aria-label="Task list">
              {todos.length === 0 && (
                <li className="todo-empty">No tasks yet — add one above!</li>
              )}
              {todos.map(todo => (
                <li
                  key={todo.id}
                  className={`todo-item${todo.completed ? ' completed' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />

                  {editingId === todo.id ? (
                    <div className="todo-edit-group">
                      <input
                        className="todo-edit-input"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  saveEdit(todo.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        aria-label="Edit task"
                      />
                      <button className="todo-btn todo-btn--save"   onClick={() => saveEdit(todo.id)}>Save</button>
                      <button className="todo-btn todo-btn--cancel" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <span
                      className="todo-title"
                      onDoubleClick={() => startEdit(todo)}
                      title="Double-click to edit"
                    >
                      {todo.title}
                    </span>
                  )}

                  <button
                    className="todo-btn todo-btn--delete"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label={`Delete "${todo.title}"`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>

            <footer className="todo-footer">
              <span className="todo-count">
                {remaining} task{remaining !== 1 ? 's' : ''} remaining
              </span>
              <div className="todo-actions">
                <button className="todo-btn todo-btn--action" onClick={exportCSV}>
                  ⬇️ Export CSV
                </button>
                <button className="todo-btn todo-btn--action" onClick={() => fileInputRef.current.click()}>
                  ⬆️ Import CSV
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={importCSV}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
