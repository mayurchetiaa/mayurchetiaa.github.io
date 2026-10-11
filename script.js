 const photos = [
{
image: "IMG_0693.jpeg",
title: "Untitled 01",
category: "Nature",
description: "A moment captured through my lens."
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
