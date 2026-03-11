(function () {
  var toc = document.querySelector('.post__toc');
  if (!toc || window.innerWidth <= 1249) return;

  var tocLinks = toc.querySelectorAll('.toc-link');
  if (!tocLinks.length) return;

  var headingIds = [];
  tocLinks.forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (id) headingIds.push(id);
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        tocLinks.forEach(function (link) {
          var id = decodeURIComponent(link.getAttribute('href').slice(1));
          link.classList.toggle('is-active', id === entry.target.id);
        });
      }
    });
  }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

  headingIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();
