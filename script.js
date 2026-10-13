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

  let photos = [originalPhoto];

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
              onerror="this.alt='Image could not be loaded';"
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
          "<p>No photos found in this category.</p>";
      }
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
          throw new Error(
            `${category}: GitHub returned ${response.status}`
          );
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

    const failedFolders = allResults
      .map((result, index) =>
        result.status === "rejected" ? categories[index] : null
      )
      .filter(Boolean);

    photos = [
      originalPhoto,
      ...uploadedPhotos.filter(photo =>
        !(photo.title === "IMG_0693" &&
          photo.category === "Landscapes")
      )
    ];

    displayPhotos("All");

    if (failedFolders.length) {
      console.error("Could not scan these folders:", failedFolders);
      console.error(
        "GitHub API requests failed. Check the folder names and try again later."
      );
    }

    console.log("Total photos found:", photos.length);
    console.log("Folders that failed:", failedFolders);
  }

  loadPhotos().catch(error => {
    console.error("Gallery loading error:", error);
  });
})();
