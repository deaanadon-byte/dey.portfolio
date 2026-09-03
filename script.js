(function(){
  "use strict";

  // ---------- In-memory data (resets on reload; no browser storage is used) ----------
  var data = { quiz: [], laboratory: [], exam: [], activities: [] };
  var nextId = 1;
  var rotations = [-3, 2, -1.5, 1, -2.5, 3, -1, 2];
  var currentModalSection = null;
  var pendingImageDataUrl = null;

  var sectionLabels = {
    quiz: "quiz",
    laboratory: "lab activity",
    exam: "exam",
    activities: "activity"
  };

  function escapeHtml(str){
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  // ---------- Tab switching ----------
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".panel");

  tabs.forEach(function(tab){
    tab.addEventListener("click", function(){
      tabs.forEach(function(t){
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      var target = tab.getAttribute("data-tab");
      panels.forEach(function(p){
        p.classList.toggle("active", p.id === target);
      });
    });
  });

  // ---------- Profile editing ----------
  var profileDisplay = document.getElementById("profile-display");
  var profileForm = document.getElementById("profile-form");
  var editBtn = document.getElementById("edit-profile-btn");
  var cancelProfileBtn = document.getElementById("cancel-profile-btn");
  var inputName = document.getElementById("input-name");
  var inputDesc = document.getElementById("input-desc");
  var profileNameEl = document.getElementById("profile-name");
  var profileDescEl = document.getElementById("profile-desc");
  var heroName = document.getElementById("hero-name");
  var heroDesc = document.getElementById("hero-desc");

  editBtn.addEventListener("click", function(){
    inputName.value = profileNameEl.textContent;
    inputDesc.value = profileDescEl.textContent;
    profileDisplay.classList.add("hidden");
    profileForm.classList.add("active");
    inputName.focus();
  });

  cancelProfileBtn.addEventListener("click", function(){
    profileForm.classList.remove("active");
    profileDisplay.classList.remove("hidden");
  });

  profileForm.addEventListener("submit", function(e){
    e.preventDefault();
    var name = inputName.value.trim() || "Your Name";
    var desc = inputDesc.value.trim();
    profileNameEl.textContent = name;
    profileDescEl.textContent = desc;
    heroName.textContent = name;
    heroDesc.textContent = desc || "Write a short introduction about yourself in the Profile tab.";
    profileForm.classList.remove("active");
    profileDisplay.classList.remove("hidden");
  });

  // ---------- Card rendering ----------
  function renderSection(section){
    var grid = document.getElementById(section + "-cards");
    var items = data[section];

   

    grid.innerHTML = items.map(function(item, i){
      var rot = rotations[i % rotations.length];
      var media = item.image
        ? '<img class="card-img" src="' + item.image + '" alt="' + escapeHtml(item.title) + '">'
        : '<div class="card-placeholder">✎</div>';
      var notes = item.notes ? '<p>' + escapeHtml(item.notes) + '</p>' : '';

      return '<article class="card" style="--rot:' + rot + 'deg">' +
        '<span class="tape"></span>' +
        media +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        notes +
        '<button class="delete-btn" data-section="' + section + '" data-id="' + item.id + '" aria-label="Remove this card">✕</button>' +
        '</article>';
    }).join("");
  }

  // Delete handling via event delegation
  ["quiz", "laboratory", "exam", "activities"].forEach(function(section){
    document.getElementById(section + "-cards").addEventListener("click", function(e){
      var btn = e.target.closest(".delete-btn");
      if(!btn) return;
      var id = Number(btn.getAttribute("data-id"));
      data[section] = data[section].filter(function(c){ return c.id !== id; });
      renderSection(section);
    });
    renderSection(section);
  });

  // ---------- Modal (add card) ----------
  var overlay = document.getElementById("modal-overlay");
  var modalTitle = document.getElementById("modal-title");
  var cardForm = document.getElementById("card-form");
  var cardTitleInput = document.getElementById("card-title");
  var cardNotesInput = document.getElementById("card-notes");
  var cardImageInput = document.getElementById("card-image");
  var imagePreview = document.getElementById("image-preview");
  var cancelCardBtn = document.getElementById("cancel-card-btn");

  document.querySelectorAll(".add-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      currentModalSection = btn.getAttribute("data-section");
      modalTitle.textContent = "Add " + sectionLabels[currentModalSection];
      cardForm.reset();
      imagePreview.style.display = "none";
      pendingImageDataUrl = null;
      overlay.classList.add("active");
      cardTitleInput.focus();
    });
  });

  function closeModal(){
    overlay.classList.remove("active");
    currentModalSection = null;
    pendingImageDataUrl = null;
  }

  cancelCardBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", function(e){
    if(e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && overlay.classList.contains("active")) closeModal();
  });

  cardImageInput.addEventListener("change", function(){
    var file = cardImageInput.files[0];
    if(!file){
      pendingImageDataUrl = null;
      imagePreview.style.display = "none";
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e){
      pendingImageDataUrl = e.target.result;
      imagePreview.src = pendingImageDataUrl;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  cardForm.addEventListener("submit", function(e){
    e.preventDefault();
    if(!currentModalSection) return;

    var title = cardTitleInput.value.trim();
    if(!title) return;
    var notes = cardNotesInput.value.trim();

    data[currentModalSection].push({
      id: nextId++,
      title: title,
      notes: notes,
      image: pendingImageDataUrl
    });

    renderSection(currentModalSection);
    closeModal();
  });

})();
