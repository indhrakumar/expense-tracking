const EMOJIS = {
  Food: "🍔",
  Transport: "🚗",
  Shopping: "🛍",
  Health: "💊",
  Entertainment: "🎬",
  Utilities: "💡",
  Education: "📚",
  Salary: "💼",
  Business: "📈",
  Other: "🔖",
};
const COLORS = [
  "#7c6af7",
  "#3dd68c",
  "#f7b96a",
  "#f76a6a",
  "#6ac8f7",
  "#f76ac8",
  "#c8f76a",
  "#6af7c8",
  "#f7c86a",
  "#888",
];

let txs = [];
let curType = "income";
let isDark = true;
function load() {
  try {
    const d = localStorage.getItem("xpense_v1");
    if (d) txs = JSON.parse(d);
  } catch (e) {}
}
function save() {
  try {
    localStorage.setItem("xpense_v1", JSON.stringify(txs));
  } catch (e) {}
}
function setType(t) {
  curType = t;
  document.getElementById("btn-income").className =
    "type-btn" + (t === "income" ? " active income" : "");
  document.getElementById("btn-expense").className =
    "type-btn" + (t === "expense" ? " active expense" : "");
}

// Toggle dark and light theme buttom
function toggleTheme() {
  isDark = !isDark;
  document.body.setAttribute("data-theme", isDark ? "" : "light");
  document.querySelector(".theme-btn").textContent = isDark
    ? "☀ Light"
    : "🌙 Dark";
}

function fmt(n) {
  return (
    "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })
  );
}

// Add transaction
function addTx() {
  const desc = document.getElementById("desc").value.trim();
  const amt = parseFloat(document.getElementById("amount").value);
  const cat = document.getElementById("category").value;
  const date =
    document.getElementById("txdate").value ||
    new Date().toISOString().split("T")[0];
  if (!desc || !amt || amt <= 0) return;
  txs.unshift({ id: Date.now(), desc, amt, cat, date, type: curType });
  save();
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  render();
}

// Delete
function delTx(id) {
  txs = txs.filter((t) => t.id !== id);
  save();
  render();
}

// IntersectionObserver for scroll animations
function observeTx() {
  const items = document.querySelectorAll(".tx-item");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        } else {
          e.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
  );
  items.forEach((el) => io.observe(el));
}

// Main render
function render() {
  const inc = txs
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amt, 0);
  const exp = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amt, 0);

  document.getElementById("totalBal").textContent = fmt(inc - exp);
  document.getElementById("totalInc").textContent = fmt(inc);
  document.getElementById("totalExp").textContent = fmt(exp);
  document.getElementById("txCount").textContent = txs.length;

  // This month expenses
  const now = new Date();
  const m = now.getMonth(),
    y = now.getFullYear();
  const mExp = txs
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getMonth() === m &&
        new Date(t.date).getFullYear() === y,
    )
    .reduce((s, t) => s + t.amt, 0);
  document.getElementById("monthExp").textContent = fmt(mExp);

  // Average expense
  const expTxs = txs.filter((t) => t.type === "expense");
  const avgE = expTxs.length
    ? expTxs.reduce((s, t) => s + t.amt, 0) / expTxs.length
    : 0;
  document.getElementById("avgExp").textContent = fmt(avgE);

  // Top category
  const catMap = {};
  expTxs.forEach((t) => (catMap[t.cat] = (catMap[t.cat] || 0) + t.amt));
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("topCat").textContent = topCat
    ? (EMOJIS[topCat[0]] || "") + " " + topCat[0]
    : "—";

  // Category bars
  const catEl = document.getElementById("catBars");
  if (!Object.keys(catMap).length) {
    catEl.innerHTML = '<div class="empty">No expenses yet</div>';
  } else {
    const maxV = Math.max(...Object.values(catMap));
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    catEl.innerHTML = entries
      .map(
        (e, i) => `
      <div class="cat-row">
        <span class="cat-name">${EMOJIS[e[0]] || "🔖"} ${e[0]}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar" style="width:${Math.round((e[1] / maxV) * 100)}%; background:${COLORS[i % COLORS.length]}"></div>
        </div>
        <span class="cat-amt" style="color:${COLORS[i % COLORS.length]}">${fmt(e[1])}</span>
      </div>`,
      )
      .join("");
  }

  // Filter + search transactions
  const q = document.getElementById("search").value.toLowerCase();
  const ft = document.getElementById("filterType").value;
  const fc = document.getElementById("filterCat").value;
  const filtered = txs.filter((t) => {
    if (ft && t.type !== ft) return false;
    if (fc && t.cat !== fc) return false;
    if (
      q &&
      !t.desc.toLowerCase().includes(q) &&
      !t.cat.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const list = document.getElementById("txList");
  if (!filtered.length) {
    list.innerHTML = '<div class="empty">No transactions found</div>';
    return;
  }

  list.innerHTML = filtered
    .map(
      (t) => `
    <div class="tx-item" data-id="${t.id}">
      <div class="tx-icon ${t.type}-ic">${EMOJIS[t.cat] || "🔖"}</div>
      <div class="tx-info">
        <div class="tx-name">${t.desc}</div>
        <div class="tx-meta">${t.cat} &bull; ${t.type}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amt ${t.type === "income" ? "pos" : "neg"}">${t.type === "income" ? "+" : "-"}${fmt(t.amt)}</div>
        <div class="tx-date">${new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
      </div>
      <button class="del-btn" onclick="delTx(${t.id})" aria-label="Delete transaction">
        <i class="ti ti-trash" aria-hidden="true"></i>
      </button>
    </div>`,
    )
    .join("");

  observeTx();
}

// Init
load();
document.getElementById("txdate").value = new Date()
  .toISOString()
  .split("T")[0];

render();
