"use strict";

$(document).ready(function () {

// mobile nav toggle

$(".sp-nav-open").on("click", function () {
  $(".sp-nav-menu").addClass("show");
});
$(".sp-nav-close").on("click", function () {
  $(".sp-nav-menu").removeClass("show");
});

// back to top button

$(".footer-backtotop-button").on("click", function () {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});

// blog filter and search

let keyword = "";
let search = "";
function updateGridList() {
  $(".grid-list-item").hide();
  $(".grid-list-item").each(function () {
    if ($(this).attr("data-filter-keywords").includes(keyword) && $(this).text().toLowerCase().includes(search)) {
      $(this).fadeIn();
    }
  });
}

$(".grid-list-filter-button").on("click", function () {
  if ($(this).hasClass("active")) {
    keyword = "";
    $(this).removeClass("active");
  } else {
    keyword = $(this).attr("data-filter-keyword");
    $(".grid-list-filter-button").removeClass("active");
    $(this).addClass("active");
  }
  updateGridList();
});

$(".grid-list-search-wrapper").on("submit", function () {
  search = $("#grid-list-search").val().toLowerCase();
  updateGridList();
});

// pricelist tabs

$(".pricelist-selector-button").on("click", function () {
  const target = $(this).attr("data-target");
  $(".pricelist-tab").hide();
  $(`.pricelist-tab[data-identifier="${target}"]`).fadeIn();
  $(".pricelist-selector-button").removeClass("active");
  $(this).addClass("active");
});

});