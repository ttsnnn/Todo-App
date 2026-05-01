import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");
const todoDeadline = document.getElementById("deadline-input");

let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addToForm();
});

function addToForm() {
  const todoText = todoInput.value.trim();
  const deadline = todoDeadline.value ? dayjs(todoDeadline.value).format("DD.MM.YY") : "No deadline";

  if (todoText.length > 0) {
    const todoObject = {
      text: todoText,
      completed: false,
      deadline
    };

    allTodos.push(todoObject);
    updateTodoList();
    saveTodos();

    todoInput.value = "";
    todoDeadline.value = "";
  }
}

function updateTodoList() {
  todoListUL.innerHTML = "";

  allTodos.forEach((todo, todoIndex) => {
    const newTodoItem = createNewTodoItem(todo, todoIndex);
    todoListUL.append(newTodoItem);
  });
}

function createNewTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  const todoDeadline = todo.deadline;

  todoLI.className = "todo";
  todoLI.innerHTML = `
     <input type="checkbox" id="${todoId}">
      <label for="${todoId}" class="custom-checkbox">
        <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
          <path
            d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
        </svg>
      </label>
      <div class="todo-content">
      <label for="${todoId}" class="todo-text">
        ${todoText}
      </label>
      <p class="todo-deadline">
      Due: ${todoDeadline}
      </p>
      </div>
      <button class="delete-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </button>
  `;

  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", () => {
    deleteTodoItem(todoIndex);
  });

  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    allTodos[todoIndex].completed = checkbox.checked;
    saveTodos();
  });
  checkbox.checked = todo.completed;

  return todoLI;
}

function deleteTodoItem(todoIndex) {
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  saveTodos();
  updateTodoList();
}

function saveTodos() {
  const todoJson = JSON.stringify(allTodos);
  localStorage.setItem("todos", todoJson);
}

function getTodos() {
  const todos = localStorage.getItem("todos") || "[]";
  return JSON.parse(todos);
}