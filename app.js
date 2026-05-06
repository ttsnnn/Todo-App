import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");
const todoDeadline = document.getElementById("deadline-input");

const sortNewBtn = document.getElementById("sort-new");
const sortOldBtn = document.getElementById("sort-old");

let allTodos = [];

getTodosFromServer();
updateTodoList();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addToForm();
});

/* sorting from new to old tasks */
sortNewBtn.addEventListener("click", () => {
  allTodos.sort((a, b) => {
    if (a.deadline === "No deadline" && b.deadline === "No deadline") return 0;
    if (a.deadline === "No deadline") return 1;
    if (b.deadline === "No deadline") return -1;

    const [dayA, monA, yrA] = a.deadline.split(".");
    const [dayB, monB, yrB] = b.deadline.split(".");

    const dateA = new Date(`20${yrA}-${monA}-${dayA}`);
    const dateB = new Date(`20${yrB}-${monB}-${dayB}`);

    return dateB - dateA;
  });
  updateTodoList();
});

/* sorting from old to new tasks */
sortOldBtn.addEventListener("click", () => {
  allTodos.sort((a, b) => {
    if (a.deadline === "No deadline" && b.deadline === "No deadline") return 0;
    if (a.deadline === "No deadline") return 1;
    if (b.deadline === "No deadline") return -1;

    const [dayA, monA, yrA] = a.deadline.split(".");
    const [dayB, monB, yrB] = b.deadline.split(".");

    const dateA = new Date(`20${yrA}-${monA}-${dayA}`);
    const dateB = new Date(`20${yrB}-${monB}-${dayB}`);

    return dateA - dateB;
  });
  updateTodoList();
});

/* updating list */
function updateTodoList() {
  todoListUL.innerHTML = "";

  if (allTodos.length === 0) {
    todoListUL.innerHTML = `<p class="empty-tasks">Task list is empty. Add something!</p>`;
    return;
  }

  allTodos.forEach((todo, todoIndex) => {
    const newTodoItem = createNewTodoItem(todo, todoIndex);
    todoListUL.append(newTodoItem);
  });
}

/* creating new todo */
function createNewTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  const todoDeadline = todo.deadline;
  const today = new Date;
  today.setHours(0, 0, 0, 0);

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

  /* changing the checkbox and saving changes */
  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", async () => {
    const todoId = allTodos[todoIndex]._id;
    const isCompleted = checkbox.checked;

    try {
      const response = await fetch(`http://localhost:3000/api/todos/${todoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed: isCompleted })
      });

      if (response.ok) {
        allTodos[todoIndex].completed = isCompleted;
      }
    } catch (error) {
      console.error("Error", error);
      checkbox.checked = !isCompleted;
    }
  });
  checkbox.checked = todo.completed;

  if (todoDeadline !== 'No deadline') {
    const [day, mon, yr] = todoDeadline.split('.');
    const deadline = new Date(`20${yr}-${mon}-${day}`);

    if(deadline < today) {
      todoLI.querySelector(".todo-deadline").style.color = "red";
    }
  }

  return todoLI;
}

/* adding to form */
async function addToForm() {
  const todoText = todoInput.value.trim();
  const deadline = todoDeadline.value ? dayjs(todoDeadline.value).format("DD.MM.YY") : "No deadline";

  if (todoText.length > 0) {
    const todoObject = {
      text: todoText,
      completed: false,
      deadline
    };

    try {
      const response = await fetch("http://localhost:3000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(todoObject)
      });

      const newTodo = await response.json();
      allTodos.push(newTodo);
      updateTodoList();

      todoInput.value = "";
      todoDeadline.value = "";
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

/* deleting todo */
async function deleteTodoItem(todoIndex) {
  const todoId = allTodos[todoIndex]._id;
  const todoText = allTodos[todoIndex].text;

  if (!confirm(`Are you sure you want to delete the task: ${todoText}?`)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/todos/${todoId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      allTodos = allTodos.filter((_, i) => i !== todoIndex);
      updateTodoList();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

/* getting todos */
async function getTodosFromServer() {
  try {
    const response = await fetch("http://localhost:3000/api/todos");
    allTodos = await response.json();
    updateTodoList();
  } catch (error) {
    console.error("Error: ", error);
  }
}
