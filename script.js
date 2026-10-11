const photos = [
{
image: "images/IMG_0693.jpeg",
title: "Untitled 01",
category: "Nature",
description: "A moment captured through my lens."
}
];

document.addEventListener("DOMContentLoaded", () => {
const loader = document.getElementById("loader");
const loaderBar = document.getElementById("loader-bar");
const loaderPercent = document.getElementById("loader-percent");
const gallery = document.getElementById("gallery");
const heroImage = document.getElementById("hero-image");
const filters = document.querySelectorAll(".filter");
const year = document.getElementById("year");

// Automatically update the copyright year
if (year) {
year.textContent = new Date().getFullYear();
}

// Use the uploaded photograph as the hero background
if (heroImage && photos.length > 0) {
heroImage.style.backgroundImage =
"url("${photos[0].image}")";
}

// Display photographs in the gallery
function displayPhotos(category = "All") {
if (!gallery) return;

const filteredPhotos = photos.filter(photo =>
  category === "All" || photo.category === category
);

gallery.innerHTML = filteredPhotos.map((photo, index) => `
  <article class="photo-card" style="animation-delay:${index * 100}ms">
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

// Show a message if a category has no photographs
if (filteredPhotos.length === 0) {
  gallery.innerHTML = `
    <p style="color:#99958e">
      More stories coming soon.
    </p>
  `;
}

}

displayPhotos();

// Make category filters work
filters.forEach(button => {
button.addEventListener("click", () => {
filters.forEach(filter =>
filter.classList.remove("active")
);

  button.classList.add("active");
  displayPhotos(button.dataset.filter);
});

});

// Animate the loading percentage
let progress = 0;

const loadingInterval = setInterval(() => {
progress += Math.floor(Math.random() * 8) + 3;

if (progress >= 100) {
  progress = 100;
  clearInterval(loadingInterval);
}

if (loaderBar) {
  loaderBar.style.width = `${progress}%`;
}

if (loaderPercent) {
  loaderPercent.textContent = `${progress}%`;
}

if (progress === 100) {
  setTimeout(() => {
    if (loader) {
      loader.classList.add("hide");
    }

    document.body.classList.remove("loading");
  }, 350);
}

}, 100);

// Prevent scrolling while the loading screen is visible
document.body.classList.add("loading");

// Reveal gallery cards when they enter the viewport
if ("IntersectionObserver" in window) {
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
});
}, {
threshold: 0.1
});

document.querySelectorAll(".photo-card").forEach(card => {
  observer.observe(card);
});

}
});
