# Travel with Faisal

A personal travel photography portfolio showcasing 96 photos across 12 destinations in Bangladesh and India.

## Features

- Hero slideshow cycling through all destinations
- Destinations grid with cover photo and photo count
- Filterable masonry gallery with lazy loading
- Lightbox with keyboard and touch swipe navigation
- Scroll reveal animations and responsive navbar

## Destinations

**Bangladesh** — Sajek Valley, Sreemangal, Bandarban, Kushtia, Cox's Bazar, Rangamati, Saint Martin, Sunamganj, Gazipur

**India** — Meghalaya, Agra, Delhi

## Stack

Vanilla HTML, CSS, and JavaScript — no frameworks or build tools required. Open `index.html` directly in a browser.

## Project Structure

```
travel-with-faisal/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── gallery.js       # all data, UI logic, and slideshow
└── images/
    └── <destination>/   # one folder per destination
```

## Adding Photos

1. Drop the images into `images/<destination>/` named as `<destination>-01.jpg`, `<destination>-02.jpg`, etc.
2. Update the `images` count for that destination in the `DESTINATIONS` array in `js/gallery.js`.
3. Update the total photo count in `index.html` (`statPhotos` and `galleryCount`).
