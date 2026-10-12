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

  let photos = [];

  // Loading animation
  let progress = 0;

  document.body.classList.add("loading");

  const timer = setInterval(() => {
    progress = Math.min(progress + 2, 100);

    if (loaderBar) {
      loaderBar.style.width = progress + "%";
    }

    if (loaderPercent) {
      loaderPercent.textContent = progress + "%";
    }

    if (progress >= 100) {
      clearInterval(timer);
      hideLoader();
    }
  }, 20);

  function hideLoader() {
    if (loader) loader.classList.add("hide");
    document.body.classList.remove("loading");
  }

  // Safety fallback
  setTimeout(() => {
    clearInterval(timer);
    hideLoader();
  }, 3000);

  async function loadPhotos() {
    const gallery = document.getElementById("gallery");
    const heroImage = document.getElementById("hero-image");
    const year = document.getElementById("year");
    const filters = document.querySelectorAll(".filter");

    if (year) {
      year.textContent = new Date().getFullYear();
    }

    // Read every category folder from GitHub
    const results = await Promise.all(
      categories.map(async category => {
        const apiURL =
          `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${category}?ref=${BRANCH}`;

        try {
          const response = await fetch(apiURL);

          if (!response.ok) return [];

          const files = await response.json();

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
          console.error("Could not load " + category, error);
          return [];
        }
      })
    );

    photos = results.flat();

    // Keep the original photo visible if no category photos are found
    if (
      photos.length === 0 &&
      document.querySelector('img[src="IMG_0693.jpeg"]') === null
    ) {
      photos.push({
        image: "IMG_0693.jpeg",
        title: "Untitled 01",
        category: "Nature",
        description: "A moment captured through my lens."
      });
    }

    if (heroImage && photos.length) {
      heroImage.style.backgroundImage =
        `url("${photos[0].image}")`;
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
          '<p>Photos for this category will appear here when uploaded.</p>';
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
  }

  loadPhotos().catch(error => {
    console.error("Gallery loading error:", error);
  });
})();
