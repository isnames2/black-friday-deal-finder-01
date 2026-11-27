// DealHound app logic: render, search, filter and sort the Black Friday deals.
//
// Every number shown is computed from the deal's own sale and usual prices,
// so the discount and the saving always add up. State lives in one object;
// render() rebuilds the grid from it. All controls are wired here and only
// here, so the page works with no network and no other script.

import { CHECKED_DATE, DEALS, CATEGORIES, VERDICTS } from "./deals.js";

const state = {
  query: "",
  category: "All",
  store: "All",
  minDiscount: 0,
  verdict: "All",
  sort: "discount",
};

const grid = document.getElementById("deal-grid");
const countLine = document.getElementById("result-count");
const emptyNote = document.getElementById("empty-note");

function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

function discountPct(d) {
  return Math.round((1 - d.sale / d.usual) * 100);
}

function saving(d) {
  return d.usual - d.sale;
}

function verdictBadge(d) {
  const v = VERDICTS[d.verdict];
  return `<span class="verdict verdict-${d.verdict}" title="${v.blurb}">${v.label}</span>`;
}

function dealCard(d) {
  const pct = discountPct(d);
  const also =
    d.alsoAt && d.alsoAt.length
      ? `<p class="also">Also at: ${d.alsoAt
          .map((a) => `${a.store} ${money(a.price)}`)
          .join(" · ")}</p>`
      : "";
  return `<article class="card" data-id="${d.id}">
    <div class="card-top">
      <span class="category">${d.category}</span>
      ${verdictBadge(d)}
    </div>
    <h3>${d.product}</h3>
    <p class="store">${d.store}</p>
    <p class="prices"><span class="sale">${money(d.sale)}</span>
      <span class="usual">${money(d.usual)}</span>
      <span class="pct">-${pct}%</span></p>
    <p class="save">You save ${money(saving(d))}</p>
    <p class="evidence">${d.evidence}</p>
    ${also}
    <p class="checked">Checked ${CHECKED_DATE} · Source: ${d.source}</p>
    <a class="store-link" href="${d.link}" target="_blank" rel="noopener">View at ${d.store} &rarr;</a>
  </article>`;
}

function filteredDeals() {
  const q = state.query.trim().toLowerCase();
  let list = DEALS.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (discountPct(d) < state.minDiscount) return false;
    if (state.verdict !== "All" && d.verdict !== state.verdict) return false;
    if (q && !(d.product + " " + d.store + " " + d.category).toLowerCase().includes(q))
      return false;
    return true;
  });
  const byDiscount = (a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a);
  const bySaving = (a, b) => saving(b) - saving(a) || discountPct(b) - discountPct(a);
  const byPrice = (a, b) => a.sale - b.sale;
  const byNewLow = (a, b) => {
    const rank = { "new-low": 0, strong: 1, routine: 2 };
    return rank[a.verdict] - rank[b.verdict] || byDiscount(a, b);
  };
  if (state.sort === "discount") list.sort(byDiscount);
  else if (state.sort === "saving") list.sort(bySaving);
  else if (state.sort === "price") list.sort(byPrice);
  else if (state.sort === "newlow") list.sort(byNewLow);
  return list;
}

function render() {
  const list = filteredDeals();
  grid.innerHTML = list.map(dealCard).join("");
  countLine.textContent =
    list.length === DEALS.length
      ? `Showing all ${DEALS.length} deals`
      : `Showing ${list.length} of ${DEALS.length} deals`;
  emptyNote.hidden = list.length > 0;
}

function fillStores() {
  const select = document.getElementById("store-filter");
  const stores = [...new Set(DEALS.map((d) => d.store))].sort();
  for (const s of stores) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  }
}

function fillCategories() {
  const wrap = document.getElementById("category-chips");
  const all = document.createElement("button");
  all.type = "button";
  all.className = "chip active";
  all.dataset.category = "All";
  all.textContent = "All categories";
  wrap.appendChild(all);
  for (const c of CATEGORIES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.category = c;
    b.textContent = c;
    wrap.appendChild(b);
  }
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.category = btn.dataset.category;
    wrap.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === btn));
    render();
  });
}

function wireControls() {
  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });
  document.getElementById("store-filter").addEventListener("change", (e) => {
    state.store = e.target.value;
    render();
  });
  document.getElementById("discount-filter").addEventListener("change", (e) => {
    state.minDiscount = Number(e.target.value);
    render();
  });
  document.getElementById("verdict-filter").addEventListener("change", (e) => {
    state.verdict = e.target.value;
    render();
  });
  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });
  document.getElementById("reset").addEventListener("click", () => {
    state.query = "";
    state.category = "All";
    state.store = "All";
    state.minDiscount = 0;
    state.verdict = "All";
    state.sort = "discount";
    document.getElementById("search").value = "";
    document.getElementById("store-filter").value = "All";
    document.getElementById("discount-filter").value = "0";
    document.getElementById("verdict-filter").value = "All";
    document.getElementById("sort").value = "discount";
    document
      .querySelectorAll("#category-chips .chip")
      .forEach((x) => x.classList.toggle("active", x.dataset.category === "All"));
    render();
  });
}

function renderSummary() {
  const stores = new Set(DEALS.map((d) => d.store)).size;
  const biggest = DEALS.reduce((a, b) => (saving(b) > saving(a) ? b : a));
  const avg = Math.round(DEALS.reduce((s, d) => s + discountPct(d), 0) / DEALS.length);
  document.getElementById("stat-deals").textContent = DEALS.length;
  document.getElementById("stat-stores").textContent = stores;
  document.getElementById("stat-avg").textContent = avg + "%";
  document.getElementById("stat-biggest").textContent =
    money(saving(biggest)) + " off " + biggest.product.split("(")[0].trim();
}

fillStores();
fillCategories();
wireControls();
renderSummary();
render();
