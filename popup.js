document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snippetForm");
  const list = document.getElementById("snippetList");

  function renderSnippets(snippets) {
    list.innerHTML = "";
    snippets.forEach((s, index) => {
      const div = document.createElement("div");
      div.className = "snippet";

      const title = document.createElement("h3");
      title.textContent = s.title;

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
        chrome.storage.local.set({ snippets }, () => renderSnippets(snippets));
      };

      div.appendChild(title);
      div.appendChild(pre);
      div.appendChild(copyBtn);
      div.appendChild(deleteBtn);
      list.appendChild(div);
    });
  }

  function loadSnippets() {
    chrome.storage.local.get(["snippets"], (res) => {
      renderSnippets(res.snippets || []);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const code = document.getElementById("code").value.trim();
    if (!title || !code) return;

    chrome.storage.local.get(["snippets"], (res) => {
      const snippets = res.snippets || [];
      snippets.push({ title, code });
      chrome.storage.local.set({ snippets }, loadSnippets);
    });

    form.reset();
  });

  loadSnippets();
});
