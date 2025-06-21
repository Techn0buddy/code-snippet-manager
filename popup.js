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

        // 🔧 Actions container
        const actions = document.createElement("div");
        actions.className = "actions";

        // 📋 Copy button
        const copyBtn = document.createElement("button");
        copyBtn.setAttribute("data-tooltip", "Copy");
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v16h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h11v16z"/>
          </svg>`;
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(s.code).then(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#28a745" d="M20.285 6.709l-11.02 11.02-5.656-5.657 1.414-1.414 4.242 4.243L18.87 5.295z"/>
            </svg>`;
            setTimeout(() => {
              copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v16h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 18H8V7h11v16z"/>
                </svg>`;
            }, 1500);
          });
        };

        // 🗑️ Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("data-tooltip", "Delete");
        deleteBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>`;
        deleteBtn.onclick = () => {
          snippets.splice(index, 1);
          chrome.storage.local.set({ snippets }, () =>
            renderSnippets(snippets, search.value.toLowerCase())
          );
        };

        actions.appendChild(copyBtn);
        actions.appendChild(deleteBtn);
        div.appendChild(actions);

        const title = document.createElement("h3");
        title.textContent = s.title;

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `Language: ${s.language || "Plain Text"}`;

        const pre = document.createElement("pre");
        pre.textContent = s.code;
        pre.classList.add("collapsed");

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = "Show More";
        toggleBtn.style.fontSize = "11px";
        toggleBtn.style.marginTop = "4px";
        toggleBtn.style.backgroundColor = "#007bff";
        toggleBtn.onclick = () => {
          const isCollapsed = pre.classList.toggle("collapsed");
          toggleBtn.textContent = isCollapsed ? "Show More" : "Show Less";
        };

        div.appendChild(title);
        div.appendChild(meta);
        div.appendChild(pre);
        div.appendChild(toggleBtn);
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
