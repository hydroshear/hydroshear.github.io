window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "https://homes.cs.washington.edu/~kpar/nerfies/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    document.querySelectorAll('.task-carousel').forEach(function(carousel) {
      var items = Array.from(carousel.querySelectorAll('.item'));
      if (items.length === 0) return;
      var current = 0;

      items.forEach(function(item, i) {
        item.style.display = i === 0 ? '' : 'none';
      });

      var counter = document.createElement('span');
      counter.className = 'carousel-counter';
      counter.textContent = '1 / ' + items.length;

      var prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-nav carousel-prev';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.addEventListener('click', function() { go(current - 1); });

      var nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-nav carousel-next';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.addEventListener('click', function() { go(current + 1); });

      carousel.style.position = 'relative';
      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);
      carousel.appendChild(counter);

      function go(idx) {
        items[current].querySelectorAll('.carousel-video').forEach(function(v) { v.pause(); });
        items[current].style.display = 'none';
        current = (idx + items.length) % items.length;
        items[current].style.display = '';
        counter.textContent = (current + 1) + ' / ' + items.length;
        loadAndPlay(items[current]);
      }

      function loadAndPlay(item) {
        item.querySelectorAll('.carousel-video').forEach(function(v) {
          if (v.preload !== 'auto') {
            v.preload = 'auto';
            v.load();
          }
          if (v.readyState >= 2) {
            v.play();
          } else {
            v.addEventListener('canplay', function handler() {
              v.play();
              v.removeEventListener('canplay', handler);
            });
          }
        });
      }

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            loadAndPlay(items[current]);
          } else {
            items[current].querySelectorAll('.carousel-video').forEach(function(v) { v.pause(); });
          }
        });
      }, { threshold: 0.25 });
      observer.observe(carousel);

      loadAndPlay(items[0]);
    });

    document.querySelectorAll('.carousel-video').forEach(function(video) {
      video.addEventListener('seeked', function() { syncPair(this); });
      video.addEventListener('play', function() { syncPair(this); });
      video.addEventListener('pause', function() {
        getSibling(this).forEach(function(s) { s.pause(); });
      });
    });

    function getSibling(video) {
      var col = video.closest('.column');
      if (!col) return [];
      var vids = col.querySelectorAll('.carousel-video');
      var siblings = [];
      vids.forEach(function(v) { if (v !== video) siblings.push(v); });
      return siblings;
    }

    function syncPair(video) {
      getSibling(video).forEach(function(s) {
        if (Math.abs(s.currentTime - video.currentTime) > 0.2) {
          s.currentTime = video.currentTime;
        }
        if (!video.paused && s.paused) s.play();
      });
    }

    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    document.getElementById("single-task-result-video").playbackRate = 2.0;
    document.getElementById("multi-task-result-video").playbackRate = 2.0;
})