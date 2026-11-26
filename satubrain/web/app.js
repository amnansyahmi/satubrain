"use strict";

const byId = (id) => document.getElementById(id);
const token = location.hash.slice(1);
const storageKey = "satubrain-session";
if (token) {
  sessionStorage.setItem(storageKey, token);
  history.replaceState(null, "", location.pathname);
}
const key = sessionStorage.getItem(storageKey) || "";
const types = { note: "Note", decision: "Decision", handoff: "Handoff", message: "Message" };
const dates = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const state = { home: null, scope: null, detail: null, revision: 0 };
let searchTimer;

async function api(path, payload) {
  const headers = { "X-SatuBrain-Key": key };
  const options = { headers };
  if (payload !== undefined) {
    headers["Content-Type"] = "application/json";
    Object.assign(options, { method: "POST", body: JSON.stringify(payload) });
  }
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Memory is no longer available.");
  return result;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sameScope(left, right) {
  return Boolean(left && right && left.project === right.project
    && left.task === right.task && left.branch === right.branch);
}

function scopeParams(scope) {
  return { project: scope.project, task: scope.task, branch: scope.branch };
}

function renderScopes() {
  const list = byId("scopes");
  list.replaceChildren();
  const scope = state.scope || state.home;
  byId("project").textContent = scope.project;
  byId("branch").textContent = scope.branch;
  for (const entry of state.home.scopes) {
    const button = element("button", "task", entry.task);
    button.type = "button";
    if (sameScope(entry, state.scope)) button.setAttribute("aria-current", "true");
    const project = entry.project === scope.project ? "" : entry.project + " · ";
    button.append(element("span", "task-meta", project + entry.branch + " · " + entry.entries));
    button.addEventListener("click", () => {
      state.scope = scopeParams(entry);
      byId("query").value = "";
      byId("kind").value = "";
      renderScopes();
      loadMemories();
    });
    list.append(button);
  }
}

function renderEmpty(text) {
  byId("memories").replaceChildren(element("div", "empty", text));
}

async function loadMemories() {
  const revision = ++state.revision;
  const scope = state.scope;
  byId("title").textContent = scope ? scope.task : "Task memory";
  byId("subtitle").textContent = scope ? scope.project + " · " + scope.branch : "Choose a task to view its memory.";
  const notice = byId("notice");
  notice.textContent = "";
  if (!scope) {
    renderEmpty("Add a memory to start a task.");
    return;
  }
  const query = byId("query").value;
  const kind = byId("kind").value;
  const params = new URLSearchParams({ ...scope, query, kind });
  try {
    const { items } = await api("/api/memories?" + params);
    if (revision !== state.revision) return;
    notice.textContent = items.length === 100 ? "Showing 100 results. Refine your search to narrow the list."
      : items.length + (items.length === 1 ? " memory" : " memories");
    if (items.length === 0) {
      renderEmpty(query || kind ? "No memories match these filters." : "No memories yet for this task and branch.");
      return;
    }
    byId("memories").replaceChildren(...items.map((item) => {
      const card = element("button", "entry");
      card.type = "button";
      const meta = element("span", "entry-meta");
      meta.append(element("span", "chip " + item.kind, types[item.kind]),
        element("span", "", item.agent + " · " + dates.format(new Date(item.created_at))));
      card.append(meta, element("span", "entry-content clamp", item.text));
      card.addEventListener("click", () => openDetails(scope, item.id));
      return card;
    }));
  } catch (error) {
    if (revision === state.revision) renderEmpty(error.message);
  }
}

async function openDetails(scope, id) {
  const dialog = byId("details");
  const forget = byId("forget");
  state.detail = { scope, id };
  const selection = state.detail;
  byId("detail-title").textContent = "Memory";
  byId("detail-meta").textContent = "";
  byId("detail-text").textContent = "";
  byId("detail-notice").textContent = "Loading…";
  forget.textContent = "Delete memory";
  forget.disabled = true;
  dialog.showModal();
  try {
    const params = new URLSearchParams({ ...scope, id });
    const { item } = await api("/api/memory?" + params);
    if (!dialog.open || state.detail !== selection) return;
    byId("detail-title").textContent = types[item.kind];
    const tags = [item.agent, dates.format(new Date(item.created_at))];
    if (item.session) tags.push(item.session);
    if (item.role) tags.push(item.role + " #" + item.position);
    byId("detail-meta").textContent = tags.join(" · ");
    byId("detail-text").textContent = item.text;
    byId("detail-notice").textContent = "";
    forget.disabled = false;
  } catch (error) {
    if (dialog.open && state.detail === selection) byId("detail-notice").textContent = error.message;
  }
}

async function refreshScopes() {
  state.home = await api("/api/scopes");
  renderScopes();
}

function openEditor(newTask) {
  if (!state.home) return;
  byId("capture").reset();
  byId("editor-title").textContent = newTask ? "Start a task" : "Add memory";
  byId("entry-task").value = newTask ? "" : state.scope?.task || "";
  byId("editor-notice").textContent = "";
  byId("editor").showModal();
  byId(newTask || !state.scope ? "entry-task" : "entry-text").focus();
}

byId("new-task").addEventListener("click", () => openEditor(true));
byId("add").addEventListener("click", () => openEditor(false));
byId("filters").addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  loadMemories();
});
byId("query").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadMemories, 140);
});
byId("kind").addEventListener("change", loadMemories);
for (const button of document.querySelectorAll("[data-close]")) {
  button.addEventListener("click", () => byId(button.dataset.close).close());
}
byId("capture").addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = state.scope || state.home;
  const scope = { project: selected.project, branch: selected.branch, task: byId("entry-task").value.trim() };
  const save = byId("save");
  save.disabled = true;
  try {
    const result = await api("/api/memories", {
      ...scope, kind: byId("entry-kind").value, text: byId("entry-text").value,
    });
    if (result.status === "deleted") throw new Error("This exact memory was previously deleted.");
    state.scope = scope;
    byId("query").value = "";
    byId("kind").value = "";
    await refreshScopes();
    byId("editor").close();
    await loadMemories();
    if (result.status === "duplicate") byId("notice").textContent = "This memory is already saved.";
  } catch (error) {
    byId("editor-notice").textContent = error.message;
  } finally {
    save.disabled = false;
  }
});
byId("forget").addEventListener("click", async () => {
  const button = byId("forget");
  if (button.textContent === "Delete memory") {
    button.textContent = "Confirm deletion";
    byId("detail-notice").textContent = "This deletion also applies to synced devices.";
    return;
  }
  const { scope, id } = state.detail;
  button.disabled = true;
  try {
    await api("/api/forget", { ...scope, id });
    byId("details").close();
    await refreshScopes();
    await loadMemories();
    (byId("memories").querySelector("button") || byId("query")).focus();
  } catch (error) {
    byId("detail-notice").textContent = error.message;
    button.disabled = false;
  }
});

async function start() {
  if (!key) {
    renderEmpty("Open the dashboard link printed by the satubrain command.");
    return;
  }
  try {
    state.home = await api("/api/scopes");
    const { project, branch, task, scopes } = state.home;
    state.scope = task ? { project, branch, task } : scopes[0] && scopeParams(scopes[0]);
    renderScopes();
    await loadMemories();
  } catch (error) {
    renderEmpty(error.message);
  }
}
start();
