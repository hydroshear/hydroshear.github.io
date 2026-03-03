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

    var taskCarouselOptions = {
			slidesToScroll: 1,
			slidesToShow: 1,
			loop: true,
			infinite: true,
			autoplay: false,
    }

    var carousels = bulmaCarousel.attach('.task-carousel', taskCarouselOptions);

    function activateSlideVideos(carouselEl) {
      var activeItem = carouselEl.querySelector('.slider-item.is-active') || carouselEl.querySelector('.slider-item');
      if (!activeItem) return;
      var allVideos = carouselEl.querySelectorAll('.carousel-video');
      allVideos.forEach(function(v) { v.pause(); });
      var activeVideos = activeItem.querySelectorAll('.carousel-video');
      activeVideos.forEach(function(v) {
        if (v.preload !== 'auto') { v.preload = 'auto'; }
        v.play();
      });
    }

    for (var i = 0; i < carousels.length; i++) {
      (function(c) {
        c.on('before:show', function() {
          setTimeout(function() { activateSlideVideos(c.element); }, 100);
        });
      })(carousels[i]);
    }

    var carouselObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { activateSlideVideos(entry.target); }
        else {
          entry.target.querySelectorAll('.carousel-video').forEach(function(v) { v.pause(); });
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.task-carousel').forEach(function(el) { carouselObserver.observe(el); });

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