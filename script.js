let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");
const totalTasksEl = document.getElementById("total-tasks");
const pendingTasksEl = document.getElementById("pending-tasks");
const completedTasksEl = document.getElementById("completed-tasks");

function init() {
  renderTodos();
  updateStats();
  setupEventListeners();
}

function setupEventListeners() {
  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);
  clearAllBtn.addEventListener("click", clearAll);
}

function addTodo() {
  const text = todoInput.value.trim();

  if (text === "") {
    alert("Please enter a task");
    return;
  }

  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  updateStats();

  todoInput.value = "";
  todoInput.focus();
}

function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
  updateStats();
}

function editTodo(id, newText) {
  if (newText.trim() === "") {
    deleteTodo(id);
    return;
  }

  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, text: newText.trim() };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
  updateStats();
}

function clearCompleted() {
  if (!confirm("Are you sure you want to clear all completed tasks?")) return;

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
  updateStats();
}

function clearAll() {
  if (todos.length === 0) return;
  if (!confirm("Are you sure you want to clear ALL tasks?")) return;

  todos = [];
  saveTodos();
  renderTodos();
  updateStats();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "pending":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function renderTodos() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    const emptyText =
      currentFilter === "all"
        ? "No tasks yet. Add a task to get started!"
        : currentFilter === "pending"
        ? "No pending tasks. Great job!"
        : "No completed tasks yet.";

    todoList.innerHTML = `
            <div class="empty-state">
                <p>${emptyText}</p>
            </div>
        `;
    return;
  }

  todoList.innerHTML = "";

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              todo.completed ? "checked" : ""
            }>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `;

    const checkbox = li.querySelector(".todo-checkbox");
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");
    const todoText = li.querySelector(".todo-text");

    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    editBtn.addEventListener("click", () => {
      const currentText = todoText.textContent;
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentText;
      input.className = "edit-input";

      li.replaceChild(input, todoText);
      input.focus();
      input.select();

      const saveEdit = () => {
        editTodo(todo.id, input.value);
      };

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveEdit();
        }
      });
    });

    todoList.appendChild(li);
  });
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = `Total: ${total}`;
  pendingTasksEl.textContent = `Pending: ${pending}`;
  completedTasksEl.textContent = `Completed: ${completed}`;
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);
