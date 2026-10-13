(function () {
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

  const OWNER = "untoldstoriesfilms";
  const REPO = "storyy";
  const BRANCH = "main";

  const categories = [
    "Landscapes", "Wildlife", "Nature", "Street", "Cinematic"
  ];

  const originalPhoto = {
    image: "IMG_0693.jpeg",
    title: "Untitled 01",
    category: "Landscapes",
    description: "A moment captured through my lens."
  };

  let photos = [originalPhoto];
  let visiblePhotos = [];
  let currentIndex = 0;
  let viewer = null;

  document.body.classList.add("loading");

  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(progress + 2, 100);
    if (loaderBar) loaderBar.style.width = progress + "%";
    if (loaderPercent) loaderPercent.textContent = progress + "%";

    if (progress >= 100) {
      clearInterval(timer);
      hideLoader();
    }
  }, 20);

  function hideLoader() {
    if (loader) loader.classList.add("hide");
    document.body.classList.remove("loading");
  }

  setTimeout(() => {
    clearInterval(timer);
    hideLoader();
  }, 3000);

  // Create the photo viewer without editing index.html.
  function createViewer() {
    if (viewer) return;

    viewer = document.createElement("div");
    viewer.id = "photo-viewer";

    Object.assign(viewer.style, {
      display: "none",
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      background: "rgba(0,0,0,0.96)",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      padding: "55px 16px 24px",
      boxSizing: "border-box"
    });

    viewer.innerHTML = `
      <button type="button" data-action="close" aria-label="Close photo"
        style="position:absolute;top:14px;right:18px;border:0;background:none;color:white;font-size:36px;cursor:pointer;padding:6px 12px">×</button>
      <button type="button" data-action="prev" aria-label="Previous photo"
        style="position:absolute;left:8px;top:50%;transform:translateY(-50%);border:0;border-radius:50%;background:#222;color:white;font-size:30px;width:44px;height:44px;cursor:pointer">‹</button>
      <img data-role="image" alt=""
        style="display:block;max-width:100%;max-height:78%;object-fit:contain">
      <div data-role="caption"
        style="color:white;text-align:center;margin-top:14px;font-size:14px"></div>
      <div data-role="count"
        style="color:#bbb;text-align:center;margin-top:6px;font-size:12px"></div>
      <button type="button" data-action="next" aria-label="Next photo"
        style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;border-radius:50%;background:#222;color:white;font-size:30px;width:44px;height:44px;cursor:pointer">›</button>
    `;

    document.body.appendChild(viewer);

    viewer.addEventListener("click", event => {
      const action = event.target.closest("[data-action]")?.dataset.action;

      if (action === "close") closeViewer();
      if (action === "prev") moveViewer(-1);
      if (action === "next") moveViewer(1);

      if (event.target === viewer) closeViewer();
    });

    document.addEventListener("keydown", event => {
      if (!viewer || viewer.style.display !== "flex") return;

      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") moveViewer(-1);
      if (event.key === "ArrowRight") moveViewer(1);
    });

    // Swipe left or right on a phone.
    let touchStartX = 0;

    viewer.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    viewer.addEventListener("touchend", event => {
      const diff = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 55) moveViewer(diff < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openViewer(index) {
    if (!visiblePhotos.length) return;

    createViewer();
    currentIndex = index;
    updateViewer();
    viewer.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function updateViewer() {
    const photo = visiblePhotos[currentIndex];
    if (!photo || !viewer) return;

    viewer.querySelector('[data-role="image"]').src = photo.image;
    viewer.querySelector('[data-role="image"]').alt = photo.title;
    viewer.querySelector('[data-role="caption"]').textContent =
      photo.title + " · " + photo.category;
    viewer.querySelector('[data-role="count"]').textContent =
      `${currentIndex + 1} / ${visiblePhotos.length}`;
  }

  function moveViewer(direction) {
    if (!visiblePhotos.length) return;

    currentIndex =
      (currentIndex + direction + visiblePhotos.length) %
      visiblePhotos.length;

    updateViewer();
  }

  function closeViewer() {
    if (!viewer) return;

    viewer.style.display = "none";
    document.body.style.overflow = "";
  }

  async function loadPhotos() {
    const gallery = document.getElementById("gallery");
    const heroImage = document.getElementById("hero-image");
    const year = document.getElementById("year");
    const filters = document.querySelectorAll(".filter");

    if (year) year.textContent = new Date().getFullYear();

    if (heroImage) {
      heroImage.style.backgroundImage = 'url("IMG_0693.jpeg")';
    }

    function displayPhotos(category) {
      if (!gallery) return;

      visiblePhotos = photos.filter(photo =>
        category === "All" || photo.category === category
      );

      gallery.innerHTML = visiblePhotos.map((photo, index) => `
        <article class="photo-card" data-photo-index="${index}"
          tabindex="0" role="button" aria-label="View ${photo.title}"
          style="cursor:zoom-in">
          <div class="photo-image-wrap">
            <img src="${photo.image}" alt="${photo.title}" loading="lazy"
              onerror="this.alt='Image could not be loaded';">
          </div>
          <div class="photo-info">
            <span>${photo.category}</span>
            <h3>${photo.title}</h3>
            <p>${photo.description}</p>
          </div>
        </article>
      `).join("");

      if (!visiblePhotos.length) {
        gallery.innerHTML =
          "<p>No photos found in this category.</p>";
      }
    }

    // Open a photo when its card is tapped or clicked.
    if (gallery) {
      gallery.addEventListener("click", event => {
        if (event.target.closest("a")) return;

        const card = event.target.closest(".photo-card");
        if (card) openViewer(Number(card.dataset.photoIndex));
      });

      gallery.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const card = event.target.closest(".photo-card");
        if (!card) return;

        event.preventDefault();
        openViewer(Number(card.dataset.photoIndex));
      });
    }

    displayPhotos("All");

    filters.forEach(button => {
      button.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        displayPhotos(button.dataset.filter || "All");
      });
    });

    const allResults = await Promise.allSettled(
      categories.map(async category => {
        const url =
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${encodeURIComponent(category)}?ref=${BRANCH}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`${category}: GitHub returned ${response.status}`);
        }

        const files = await response.json();

        if (!Array.isArray(files)) {
          throw new Error(`${category}: unexpected response`);
        }

        return files
          .filter(file =>
            file.type === "file" &&
            /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)
          )
          .map(file => ({
            image: file.download_url,
            title: file.name.replace(/\.[^/.]+$/, ""),
            category,
            description: "A moment captured through my lens."
          }));
      })
    );

    const uploadedPhotos = allResults
      .filter(result => result.status === "fulfilled")
      .flatMap(result => result.value);

    photos = [
      originalPhoto,
      ...uploadedPhotos.filter(photo =>
        !(photo.title === "IMG_0693" &&
          photo.category === "Landscapes")
      )
    ];

    // Refresh the gallery with all photos discovered.
    const activeFilter =
      document.querySelector(".filter.active")?.dataset.filter || "All";

    displayPhotos(activeFilter);

    const failedFolders = allResults
      .map((result, index) =>
        result.status === "rejected" ? categories[index] : null
      )
      .filter(Boolean);

    console.log("Total photos found:", photos.length);
    if (failedFolders.length) {
      console.error("Could not load folders:", failedFolders);
    }
  }

  loadPhotos().catch(error => {
    console.error("Gallery loading error:", error);
  });
})();
