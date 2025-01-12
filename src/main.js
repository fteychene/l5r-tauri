const { invoke } = window.__TAURI__.core;

let diceInputEl;
let keepInputEl;
let specializedInputEL;
let rollResultEl;

async function rollDices() {
  rollResultEl.textContent = await invoke("roll", { dice: parseInt(diceInputEl.value), keep: parseInt(keepInputEl.value), specialized: specializedInputEL.checked });
}

window.addEventListener("DOMContentLoaded", () => {

  diceInputEl = document.querySelector("#roll-dice-input");
  keepInputEl = document.querySelector("#roll-keep-input");
  specializedInputEL = document.querySelector("#roll-specialized-input");
  rollResultEl = document.querySelector("#roll-msg");
  document.querySelector("#roll-form").addEventListener("submit", (e) => {
    e.preventDefault();
    rollDices();
  });
});
