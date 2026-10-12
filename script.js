const photos = [
  {
    image: "IMG_0693.jpeg",
    title: "Untitled 01",
    category: "Landscapes",
    description: "A moment captured through my lens."
  },

  {
    image: "YOUR_BIRD_PHOTO.jpg",
    title: "Untitled 02",
    category: "Wildlife",
    description: "A quiet moment in the wild."
  },

  {
    image: "YOUR_FLOWER_PHOTO.jpg",
    title: "Untitled 03",
    category: "Nature",
    description: "Finding beauty in the little things."
  },

  {
    image: "YOUR_STREET_PHOTO.jpg",
    title: "Untitled 04",
    category: "Street",
    description: "Every street has a story."
  },

  {
    image: "YOUR_CINEMATIC_PHOTO.jpg",
    title: "Untitled 05",
    category: "Cinematic",
    description: "Life, captured like a film."
  },

  {
    image: "YOUR_SUNSET_PHOTO.jpg",
    title: "Untitled 06",
    category: "Landscapes",
    description: "Collecting moments, one frame at a time."
  }
];

(function () {
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");

let progress = 0;

function updateLoading() {
progress = Math.min(progress + 2, 100);

if (loaderBar) {
  loaderBar.style.width = progress + "%";
}

if (loaderPercent) {
  loaderPercent.textContent = progress + "%";
}

if (progress >= 100) {
  clearInterval(timer);

  setTimeout(() => {
    if (loader) loader.classList.add("hide");
    document.body.classList.remove("loading");
  }, 300);
}

}

document.body.classList.add("loading");

const timer = setInterval(updateLoading, 20);

// Safety fallback: never leave the welcome screen stuck.
setTimeout(() => {
if (loader) loader.classList.add("hide");
document.body.classList.remove("loading");
}, 2000);

function setupWebsite() {
const gallery = document.getElementById("gallery");
const heroImage = document.getElementById("hero-image");
const year = document.getElementById("year");
const filters = document.querySelectorAll(".filter");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (heroImage && photos.length) {
  heroImage.style.backgroundImage =
    'url("' + photos[0].image + '")';
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
          onerror="this.style.display='none';"
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
      '<p>More stories coming soon.</p>';
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

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", setupWebsite);
} else {
setupWebsite();
}
})();
