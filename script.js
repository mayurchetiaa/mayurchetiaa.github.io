document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");
  const gallery = document.getElementById("gallery");
  const filters = document.querySelectorAll(".filter");
  const year = document.getElementById("year");

  const categories = [
    "Landscapes",
    "Wildlife",
    "Nature",
    "Street",
    "Cinematic"
  ];

  let photos = [];
  let currentCategory = "All";

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function displayPhotos(category = "All") {
    if (!gallery) return;

    currentCategory = category;

    const filteredPhotos = photos.filter(photo =>
      category === "All" || photo.category === category
    );

    gallery.innerHTML = "";

    if (filteredPhotos.length === 0) {
      gallery.innerHTML =
        '<p style="color:#99958e">More stories coming soon.</p>';
      return;
    }

    filteredPhotos.forEach((photo, index) => {
      const card = document.createElement("article");
      card.className = "photo-card";

      const wrap = document.createElement("div");
      wrap.className = "photo-image-wrap";

      const img = document.createElement("img");
      img.src = photo.image;
      img.alt = photo.title || "Photograph by Mayur Chetia";
      img.loading = index < 4 ? "eager" : "lazy";

      const info = document.createElement("div");
      info.className = "photo-info";

      const label = document.createElement("span");
      label.textContent = photo.category;

      const title = document.createElement("h3");
      title.textContent = photo.title || "Untitled";

      const description = document.createElement("p");
      description.textContent =
        photo.description || "A moment captured through my lens.";

      wrap.appendChild(img);
      info.append(label, title, description);
      card.append(wrap, info);
      gallery.appendChild(card);

      img.addEventListener("error", () => {
        console.error("Could not load image:", photo.image);
      });
    });
  }

  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(filter => filter.classList.remove("active"));
      button.classList.add("active");
      displayPhotos(button.dataset.filter || "All");
    });
  });

  try {
    if (loaderPercent) loaderPercent.textContent = "30%";
    if (loaderBar) loaderBar.style.width = "30%";

    const response = await fetch("./images.json");

    if (!response.ok) {
      throw new Error("Could not load images.json");
    }

    const imageList = await response.json();

    photos = imageList.filter(photo =>
      photo.image &&
      categories.includes(photo.category)
    );

    if (loaderPercent) loaderPercent.textContent = "80%";
    if (loaderBar) loaderBar.style.width = "80%";

    displayPhotos("All");

  } catch (error) {
    console.error("Gallery loading error:", error);

    if (gallery) {
      gallery.innerHTML =
        '<p style="color:#99958e">Could not load photographs. Please try again later.</p>';
    }

  } finally {
    if (loaderBar) loaderBar.style.width = "100%";
    if (loaderPercent) loaderPercent.textContent = "100%";

    setTimeout(() => {
      if (loader) loader.classList.add("hide");
      document.body.classList.remove("loading");
    }, 350);
  }
});
