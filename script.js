(() => {
  "use strict";

  const OWNER = "untoldstoriesfilms";
  const REPO = "storyy";
  const BRANCH = "main";

  const categories = [
    "Landscapes",
    "Wildlife",
    "Nature",
    "Street",
    "Cinematic"
  ];

  const gallery = document.getElementById("gallery");
  const status = document.getElementById("gallery-status");
  const filters = document.querySelectorAll(".filter");

  const lightbox = document.getElementById("photo-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");

  let photos = [];
  let visiblePhotos = [];
  let currentIndex = 0;

  // Loading screen
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

  let progress = 0;

  const loadingTimer = setInterval(() => {
    progress = Math.min(progress + 2, 90);

    if (loaderBar) loaderBar.style.width = progress + "%";
    if (loaderPercent) loaderPercent.textContent = progress + "%";
  }, 40);

  function finishLoading() {
    clearInterval(loadingTimer);

    if (loaderBar) loaderBar.style.width = "100%";
    if (loaderPercent) loaderPercent.textContent = "100%";

    setTimeout(() => {
      if (loader) loader.classList.add("hide");
    }, 300);
  }

  setTimeout(finishLoading, 5000);

  // Current year
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Escape text for HTML
  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // Load images from a GitHub folder
  async function loadCategory(category) {
    const url =
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${category}?ref=${BRANCH}`;

    try {
      const response = await fetch(url, {
        cache: "no-store"
      });

      if (!response.ok) {
        console.error(
          "GitHub folder error:",
          category,
          response.status
        );
        return [];
      }

      const files = await response.json();

      if (!Array.isArray(files)) return [];

      return files
        .filter(file =>
          file.type === "file" &&
          /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
        )
        .map(file => ({
          image: file.download_url,
          title: file.name.replace(/\.[^.]+$/, ""),
          category: category,
          description: "A moment captured through my lens."
        }));

    } catch (error) {
      console.error("Could not load " + category, error);
      return [];
    }
  }

  // Homepage photograph
  const originalPhoto = {
    image: "IMG_0693.jpeg",
    title: "IMG_0693",
    category: "Landscapes",
    description: "A moment captured through my lens."
  };

  // Display the selected category
  function displayPhotos(category = "All") {
    if (!gallery) return;

    visiblePhotos = photos.filter(photo =>
      category === "All" || photo.category === category
    );

    if (status) {
      status.textContent = visiblePhotos.length
        ? `${visiblePhotos.length} photographs`
        : `No photos found in ${category}.`;
    }

    gallery.innerHTML = "";

    visiblePhotos.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "photo-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "photo-image-wrap";

      const img = document.createElement("img");
      img.src = photo.image;
      img.alt = photo.title;
      img.loading = index < 4 ? "eager" : "lazy";
      img.decoding = "async";

      const info = document.createElement("div");
      info.className = "photo-info";

      const categoryLabel = document.createElement("span");
      categoryLabel.textContent = photo.category;

      const title = document.createElement("h3");
      title.textContent = photo.title;

      const description = document.createElement("p");
      description.textContent = photo.description;

      img.addEventListener("error", () => {
        console.error("Image failed to load:", photo.image);
        img.alt = "Image could not be loaded";
        img.classList.add("image-error");

        description.textContent =
          "Image failed to load. Check its GitHub file.";
      });

      img.addEventListener("click", () => {
        openPhoto(index);
      });

      imageWrap.appendChild(img);
      info.appendChild(categoryLabel);
      info.appendChild(title);
      info.appendChild(description);

      card.appendChild(imageWrap);
      card.appendChild(info);

      gallery.appendChild(card);
    });
  }

  // Open full-screen viewer
  function openPhoto(index) {
    if (!visiblePhotos.length || !lightbox) return;

    currentIndex =
      (index + visiblePhotos.length) % visiblePhotos.length;

    const photo = visiblePhotos[currentIndex];

    lightboxImage.src = photo.image;
    lightboxImage.alt = photo.title;

    lightboxCaption.textContent =
      photo.title + " · " + photo.category;

    lightboxCounter.textContent =
      `${currentIndex + 1} / ${visiblePhotos.length}`;

    lightbox.classList.add("lightbox-open");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("lightbox-active");
  }

  function closePhoto() {
    if (!lightbox) return;

    lightbox.classList.remove("lightbox-open");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("lightbox-active");
    lightboxImage.src = "";
  }

  function nextPhoto() {
    openPhoto(currentIndex + 1);
  }

  function previousPhoto() {
    openPhoto(currentIndex - 1);
  }

  document.getElementById("lightbox-close")
    ?.addEventListener("click", closePhoto);

  document.getElementById("lightbox-next")
    ?.addEventListener("click", nextPhoto);

  document.getElementById("lightbox-prev")
    ?.addEventListener("click", previousPhoto);

  lightbox?.addEventListener("click", event => {
    if (event.target === lightbox) {
      closePhoto();
    }
  });

  document.addEventListener("keydown", event => {
    if (!lightbox?.classList.contains("lightbox-open")) return;

    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowRight") nextPhoto();
    if (event.key === "ArrowLeft") previousPhoto();
  });

  // Swipe left/right on mobile
  lightbox?.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  let touchStartX = 0;

  lightbox?.addEventListener("touchend", event => {
    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchEndX - touchStartX;

    if (Math.abs(difference) < 60) return;

    if (difference < 0) {
      nextPhoto();
    } else {
      previousPhoto();
    }
  }, { passive: true });

  // Category filters
  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(item => item.classList.remove("active"));
      button.classList.add("active");

      displayPhotos(button.dataset.filter || "All");
    });
  });

  // Load every category
  async function initialiseGallery() {
    if (status) {
      status.textContent = "Loading your photographs...";
    }

    const results = await Promise.all(
      categories.map(category => loadCategory(category))
    );

    const uploadedPhotos = results.flat();

    photos = [
      originalPhoto,
      ...uploadedPhotos.filter(photo =>
        !(
          photo.title.toLowerCase() === "img_0693" &&
          photo.category === "Landscapes"
        )
      )
    ];

    displayPhotos("All");
    finishLoading();
  }

  initialiseGallery().catch(error => {
    console.error("Gallery error:", error);

    if (status) {
      status.textContent =
        "Could not load photographs. Please refresh the page.";
    }

    finishLoading();
  });
})();
