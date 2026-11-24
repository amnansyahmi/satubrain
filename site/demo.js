"use strict";

const steps = {
  save: {
    context: "CLAUDE CODE · DEMO-17 · FEAT/IMPORTS",
    command: '$ satubrain handoff --task DEMO-17 --agent claude "Import tests passed. Verify cancellation on large files next."',
    result: "Handoff saved. Import tests passed. Next, verify cancellation on large files.",
  },
  resume: {
    context: "CODEX · DEMO-17 · FEAT/IMPORTS",
    command: '$ satubrain resume --task DEMO-17 "imports"',
    result: "Latest handoff from Claude Code: Import tests passed. Next, verify cancellation on large files.",
  },
  search: {
    context: "CURSOR · DEMO-17 · FEAT/IMPORTS",
    command: '$ satubrain search --task DEMO-17 "transactional"',
    result: "Decision found: Keep imports transactional.",
  },
};

const buttons = document.querySelectorAll("[data-step]");
const fields = {
  context: document.getElementById("context"),
  command: document.getElementById("command"),
  result: document.getElementById("result"),
};

function select(button) {
  const step = steps[button.dataset.step];
  for (const [field, element] of Object.entries(fields)) {
    element.textContent = step[field];
  }
  for (const option of buttons) {
    option.setAttribute("aria-pressed", String(option === button));
  }
}

for (const button of buttons) {
  button.addEventListener("click", () => select(button));
}
select(buttons[0]);
