document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snippetForm");
  const list = document.getElementById("snippetList");
  const search = document.getElementById("search");
  const titleInput = document.getElementById("title");
  const codeInput = document.getElementById("code");
  const langSelect = document.getElementById("language");

  function renderSnippets(snippets, filter = "") {
    list.innerHTML = "";
    snippets
      .filter(
        (s) =>
          s.title.toLowerCase().includes(filter) ||
          s.code.toLowerCase().includes(filter)
      )
      .forEach((s, index) => {
        const div = document.createElement("div");
        div.className = "snippet";

        const title = document.createElement("h3");
        title.textContent = s.title;

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `Language: ${s.language || "Plain Text"}`;

        const pre = document.createElement("pre");
        pre.textContent = s.code;

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(s.code).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
          });
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {
          snippets.splice(index, 1);
          chrome.storage.local.set({ snippets }, () =>
            renderSnippets(snippets, search.value.toLowerCase())
          );
        };

        div.appendChild(title);
        div.appendChild(meta);
        div.appendChild(pre);
        div.appendChild(copyBtn);
        div.appendChild(deleteBtn);
        list.appendChild(div);
      });
  }

  function loadSnippets() {
    chrome.storage.local.get(["snippets"], (res) => {
      const snippets = res.snippets || [];
      renderSnippets(snippets, search.value.toLowerCase());
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const code = codeInput.value.trim();
    const language = langSelect.value;
    if (!title || !code) return;

    chrome.storage.local.get(["snippets"], (res) => {
      const snippets = res.snippets || [];
      snippets.push({ title, code, language });
      chrome.storage.local.set({ snippets }, loadSnippets);
    });

    form.reset();
  });

  search.addEventListener("input", () => loadSnippets());

  loadSnippets();
});
