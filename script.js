const photos = [
{
image: "images/IMG_0693.jpeg",
title: "Untitled 01",
category: "Nature",
description: "A moment captured through my lens."
}
];

document.addEventListener("DOMContentLoaded", () => {
const gallery = document.querySelector("#gallery");

if (gallery) {
gallery.innerHTML = photos.map((photo, index) => "<article class="photo-card"> <img src="${photo.image}" alt="${photo.title}" loading="lazy" > <div class="photo-info"> <span>${photo.category}</span> <h3>${photo.title}</h3> <p>${photo.description}</p> </div> </article>").join("");
}
});
