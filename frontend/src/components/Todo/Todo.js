import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Todo.css";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(savedTodos);
  }, []);

  // Save todos to localStorage
  const updateLocalStorage = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (task.trim()) {
      const newTodos = [
        ...todos,
        { id: uuidv4(), task, completed: false },
      ];
      updateLocalStorage(newTodos);
      setTask("");
    }
  };

  const deleteTodo = (id) => {
    updateLocalStorage(todos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id) => {
    updateLocalStorage(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEdit = (id, currentTask) => {
    setEditId(id);
    setEditValue(currentTask);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    updateLocalStorage(
      todos.map((todo) =>
        todo.id === editId ? { ...todo, task: editValue } : todo
      )
    );
    setEditId(null);
    setEditValue("");
  };

  return (
    <div className="todo-container">
      <h1 className="todo-title">Get Things Done!</h1>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="todo-input"
          placeholder="What is the task today?"
        />
        <button type="submit" className="todo-btn">Add Task</button>
      </form>
      <div className="todo-list-container">
      {/* Todo List */}
      {todos.map((todo) => (
        <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
          {editId === todo.id ? (
            <form onSubmit={saveEdit} className="edit-form">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
              />
              <button type="submit" className="todo-btn">Save</button>
            </form>
          ) : (
            <>
              <p onClick={() => toggleComplete(todo.id)}>{todo.task}</p>
              <div className="todo-icons">
                <FontAwesomeIcon
                  className="edit-icon"
                  icon={faPenToSquare}
                  onClick={() => startEdit(todo.id, todo.task)}
                />
                <FontAwesomeIcon
                  className="delete-icon"
                  icon={faTrash}
                  onClick={() => deleteTodo(todo.id)}
                />
              </div>
            </>
          )}
        </div>
      ))}
      </div>
    </div>
  );
};

export default Todo;
