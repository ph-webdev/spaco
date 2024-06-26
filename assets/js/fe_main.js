"use strict";

$(document).ready(function () {

  // header: mobile nav toggle

  $(".sp-nav-open").on("click", function () {
    $(".sp-nav-menu").addClass("show");
  });
  $(".sp-nav-close").on("click", function () {
    $(".sp-nav-menu").removeClass("show");
  });

  // footer: back to top button

  $(".footer-backtotop-button").on("click", function () {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });

  // gallery: image lightbox controls

  let navBlocked = false;

  $("body").on("mousedown", ".slick-slide", function () {
    navBlocked = false;
    $(this).one("mousemove", function (ev) {
      if (ev.buttons) {
        navBlocked = true;
      }
      $("body").one("mouseup", function () {
        setTimeout(() => {
          navBlocked = false;
        }, 1);
      });
    });
  });

  $("body").on("click", ".gallery-image", function () {
    if (!navBlocked) {
      BigPicture({
        el: $(this).find("img")[0],
        imgSrc: $(this).find("img").attr("src"),
        gallery: document.querySelectorAll(".gallery-image > img"),
        galleryAttribute: "src",
      });
    }
  });

  // slick: initialise carousels

  const sliderOptions = {
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: false,
    dots: true,
    dotsClass: "slick-dots",
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  const gridOptions = {
    infinite: false,
    rows: 3,
    slidesPerRow: 3,
    adaptiveHeight: true,
    arrows: false,
    dots: true,
    dotsClass: "slick-paginate",
    responsive: [
      { breakpoint: 960, settings: { slidesPerRow: 2 } },
      { breakpoint: 576, settings: { slidesPerRow: 1 } },
    ],
  };

  $(".slider-slick").slick(sliderOptions);
  $(".pgrid-slick").slick(gridOptions);

  // function: slider filter

  $(`.slick-filter-button[data-for="slider"]`).on("click", function () {
    const slider = $(this).closest(".slick-wrapper").find(".slider-slick").first();
    slider.slick("slickUnfilter");
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
    } else {
      const keyword = $(this).attr("data-filter-keyword");
      $(this).parent().children(".slick-filter-button").removeClass("active");
      $(this).addClass("active");
      slider.slick("slickFilter", `[data-filter-keywords~="${keyword}"]`);
    }
  });

  // function: pgrid filter and search

  $(".pgrid-slick").slick("unslick");
  const clonedGridList = $(".pgrid-slick").clone(true);
  $(".pgrid-slick").slick(gridOptions);

  let keyword = "";
  let search = "";
  function updateGridList() {
    const newGridList = clonedGridList.clone(true);
    newGridList.children().each(function () {
      if (!$(this).attr("data-filter-keywords").includes(keyword) || !$(this).text().toLowerCase().includes(search)) {
        $(this).remove();
      }
    });
    $(".pgrid-slick").replaceWith(newGridList);
    $(".pgrid-slick").slick(gridOptions);
    $(".pgrid-slick").hide().fadeIn();
  }

  $(".slick-filter-button[data-for='pgrid']").on("click", function () {
    if ($(this).hasClass("active")) {
      keyword = "";
      $(this).removeClass("active");
    } else {
      keyword = $(this).attr("data-filter-keyword");
      $(this).parent().children(".slick-filter-button").removeClass("active");
      $(this).addClass("active");
    }
    updateGridList();
  });

  $(".slick-search-form[data-for='pgrid']").on("submit", function () {
    search = $("#slick-search").val().toLowerCase();
    updateGridList();
  });

});