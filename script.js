(function () {
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");

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

  const originalPhoto = {
    image: "IMG_0693.jpeg",
    title: "Untitled 01",
    category: "Landscapes",
    description: "A moment captured through my lens."
  };

  let photos = [];

  // Loading animation
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

  // Create the full-screen photo viewer
  const lightbox = document.createElement("div");

  lightbox.id = "photo-lightbox";
  lightbox.innerHTML = `
    <button id="lightbox-close" aria-label="Close photo">&times;</button>
    <button id="lightbox-prev" aria-label="Previous photo">&#10094;</button>
    <img id="lightbox-image" src="" alt="">
    <button id="lightbox-next" aria-label="Next photo">&#10095;</button>
    <p id="lightbox-caption"></p>
  `;

  document.body.appendChild(lightbox);

  let currentPhotoIndex = 0;

  function openPhoto(index) {
    if (!photos.length) return;

    currentPhotoIndex =
      (index + photos.length) % photos.length;

    const photo = photos[currentPhotoIndex];

    document.getElementById("lightbox-image").src = photo.image;
    document.getElementById("lightbox-image").alt = photo.title;

    document.getElementById("lightbox-caption").textContent =
      photo.title + " · " + photo.category;

    lightbox.classList.add("lightbox-open");
    document.body.classList.add("lightbox-active");
  }

  function closePhoto() {
    lightbox.classList.remove("lightbox-open");
    document.body.classList.remove("lightbox-active");
  }

  document.getElementById("lightbox-close")
    .addEventListener("click", closePhoto);

  document.getElementById("lightbox-prev")
    .addEventListener("click", () => {
      openPhoto(currentPhotoIndex - 1);
    });

  document.getElementById("lightbox-next")
    .addEventListener("click", () => {
      openPhoto(currentPhotoIndex + 1);
    });

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closePhoto();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("lightbox-open")) return;

    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowRight") {
      openPhoto(currentPhotoIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      openPhoto(currentPhotoIndex - 1);
    }
  });

  // Load photos from GitHub folders
  async function loadPhotos() {
    const gallery = document.getElementById("gallery");
    const heroImage = document.getElementById("hero-image");
    const year = document.getElementById("year");
    const filters = document.querySelectorAll(".filter");

    if (year) year.textContent = new Date().getFullYear();

    // Preserve your existing hero background
    if (heroImage) {
      heroImage.style.backgroundImage = 'url("IMG_0693.jpeg")';
    }

    photos = [originalPhoto];

    const results = await Promise.all(
      categories.map(async category => {
        const apiURL =
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${category}?ref=${BRANCH}`;

        try {
          const response = await fetch(apiURL, {
            cache: "no-store"
          });

          if (!response.ok) {
            console.error(
              `Could not load ${category}:`,
              response.status
            );
            return [];
          }

          const files = await response.json();

          if (!Array.isArray(files)) return [];

          return files
            .filter(file =>
              file.type === "file" &&
              /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)
            )
            .map(file => ({
              image: file.download_url,
              title: file.name.replace(/\.[^/.]+$/, ""),
              category: category,
              description: "A moment captured through my lens."
            }));

        } catch (error) {
          console.error(`Error loading ${category}:`, error);
          return [];
        }
      })
    );

    const uploadedPhotos = results.flat();

    // Keep the original photo, without duplicates
    photos = [
      originalPhoto,
      ...uploadedPhotos.filter(photo =>
        !(
          photo.title.toLowerCase() === "img_0693" &&
          photo.category === "Landscapes"
        )
      )
    ];

    function displayPhotos(category) {
      if (!gallery) return;

      const selected = photos.filter(photo =>
        category === "All" || photo.category === category
      );

      gallery.innerHTML = selected.map(photo => `
        <article class="photo-card">
          <div class="photo-image-wrap">
            <img
              src="${photo.image}"
              alt="${photo.title}"
              loading="lazy"
            >
          </div>

          <div class="photo-info">
            <span>${photo.category}</span>
            <h3>${photo.title}</h3>
            <p>${photo.description}</p>
          </div>
        </article>
      `).join("");

      if (!selected.length) {
        gallery.innerHTML =
          "<p>No photos found in this category yet.</p>";
      }

      // Tap any photo to view it properly
      gallery.querySelectorAll(".photo-card img")
        .forEach((img, index) => {
          img.style.cursor = "zoom-in";

          img.addEventListener("click", () => {
            const photoIndex = photos.indexOf(selected[index]);
            openPhoto(photoIndex);
          });
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
  }

  loadPhotos().catch(error => {
    console.error("Gallery loading error:", error);
  });
})();
