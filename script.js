const btn = document.getElementById("btn");
const total = document.getElementById("total");
const explist = document.getElementById("expense-list");
const scrn = document.querySelector(".displayhere");
const info = document.querySelector(".info");

let exp = JSON.parse(localStorage.getItem("expenses")) || [];

btn.addEventListener("click", addExp);
explist.addEventListener("click", deleteExpense);

start();

function start() {
  renderExpenses();
  calculate();
  checkScreen();
}

function addExp() {
  const exName = document.getElementById("name").value.trim();
  const amountValue = document.getElementById("amount").value.trim();

  if (exName === "" || amountValue === "") {
    showMessage("Please fill all fields");
    return;
  }

  const expense = {
    id: Date.now(),
    name: exName,
    amnt: Number(amountValue),
  };

  exp.push(expense);

  saveToLocalStorage();
  renderExpenses();
  calculate();
  checkScreen();

  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";
}

function renderExpenses() {
  explist.innerHTML = "";

  exp.forEach((expense) => {
    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `
      <span class="delete" data-id="${expense.id}">&times;</span>
      <h2>${expense.name}</h2>
      <h3>₹${expense.amnt}</h3>
    `;

    explist.appendChild(card);
  });
}

function calculate() {
  let overall = 0;

  exp.forEach((item) => {
    overall += item.amnt;
  });

  total.textContent = `Total: ₹${overall}`;
}

function deleteExpense(e) {
  if (!e.target.classList.contains("delete")) return;

  const id = Number(e.target.dataset.id);

  exp = exp.filter((item) => item.id !== id);

  saveToLocalStorage();
  renderExpenses();
  calculate();
  checkScreen();
}

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(exp));
}

function checkScreen() {
  if (exp.length === 0) {
    scrn.style.display = "none";
  } else {
    scrn.style.display = "block";
  }
}

function showMessage(message) {
  info.style.display = "block";
  info.textContent = message;

  setTimeout(() => {
    info.style.display = "none";
  }, 3000);
}
