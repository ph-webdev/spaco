"use strict";

$(document).ready(function () {

  // initialise sliders

  const sliderOptions = {
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: false,
    dots: true,
    dotsClass: "slick-dots",
    responsive: [
      { breakpoint: 1152, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 960,  settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 768,  settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 576,  settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
  };

  $(".slider-slick").slick(sliderOptions);

  // create lookup tables for sidebar details

  const locationStrings = new Map([...$(".booking-location-button")].map((el) => [$(el).attr("data-field-value"), $(el).find(".booking-location-name").eq(0).html()]));
  const dateStrings = new Map([...$("#booking_date > option")].map((el) => [$(el).val(), $(el).html()]));
  const timeStrings = new Map([...$(".booking-time-radio")].map((el) => [$(el).val(), $(el).next("label").html()]));
  const serviceStrings = new Map([...$(".booking-service-item")].map((el) => [$(el).attr("data-service-id"), $(el).find(".booking-service-name").eq(0).html()]));

  // booking form navigation

  function naviagteForm(pageNumber) {
    // show the correct page
    $(".form-page").hide();
    $(`.form-page[data-page="${pageNumber}"]`).show();
    $("#booking-form").scrollTop(0);
    // get form data
    const fd = new FormData($("#booking-form")[0]);
    // update details on sidebar
    const locationKey  = fd.get("booking_location_id");
    $(`.booking-detail-item[data-item="booking_location_id"]`).find(".booking-detail-content").html(
      locationStrings.get(locationKey)
    );
    const dateKey      = fd.get("booking_date");
    const starttimeKey = fd.get("booking_time_start");
    const endtimeKey   = fd.get("booking_time_end");
    $(`.booking-detail-item[data-item="booking_persons_and_time"]`).find(".booking-detail-content").html(
      $("#booking_persons_and_time_template").val()
        .replace("$1", fd.get("booking_persons_adult"))
        .replace("$2", fd.get("booking_persons_child"))
        .replace("$3", fd.get("booking_persons_toddler"))
        .replace("$4", dateStrings.get(dateKey))
        .replace("$5", timeStrings.get(starttimeKey))
        .replace("$6", timeStrings.get(endtimeKey))
    );
    const serviceIds = [...$(".booking-service-item")].map((el) => $(el).attr("data-service-id"));
    const serviceKeys = serviceIds.filter((n) => fd.get(`booking_service[${n}]`));
    $(`.booking-detail-item[data-item="booking_service"]`).find(".booking-detail-content").html(
      serviceKeys.map((key) => serviceStrings.get(key)).join("<br>") || "—"
    );
    // show details on sidebar
    $(".booking-detail-item").hide();
    $(".booking-detail-item").each(function () {
      if (parseInt($(this).attr("data-show-after-page")) < pageNumber) {
        $(this).show();
      }
    });
  }

  $(".form-navigate").on("click", function () {
    if ($(this).attr("data-field-name")) {
      const fieldName = $(this).attr("data-field-name");
      const fieldValue = $(this).attr("data-field-value");
      $(`#${fieldName}`).val(fieldValue);
    }
    const pageNumber = parseInt($(this).attr("data-page"));
    naviagteForm(pageNumber);
  });

  // booking period and time scrolling

  function scrollTime(containerJQO, targetOffset) {
    containerJQO.nextAll(".booking-time-scroll").show();
    containerJQO.stop().animate({ scrollLeft: targetOffset }, 150, function () {
      if ($(this).scrollLeft() === 0) {
        containerJQO.nextAll(".booking-time-scroll.left").hide();
      }
      if ($(this)[0].scrollWidth - $(this).scrollLeft() - $(this).outerWidth() < 1) {
        containerJQO.nextAll(".booking-time-scroll.right").hide();
      }
    });
  }

  $(".booking-period-jump").on("click", function () {
    const targetPeriod = $(this).attr("data-target");
    const targetButton = $(this).closest(".row").find(`.booking-time-radio[data-target="${targetPeriod}"] + .btn`);
    const targetContainer = targetButton.parent();
    const targetOffset = targetButton.offset().left - targetContainer.offset().left + targetContainer.scrollLeft() - targetContainer.nextAll(".booking-time-scroll.left").eq(0).outerWidth();
    scrollTime(targetContainer, targetOffset);
  });

  $(".booking-time-scroll.left").on("click", function () {
    const targetContainer = $(this).prevAll(".booking-time-container").eq(0);
    const scrollBy = Math.min(targetContainer.outerWidth() - targetContainer.nextAll(".booking-time-scroll.left").eq(0).outerWidth() - targetContainer.nextAll(".booking-time-scroll.right").eq(0).outerWidth(), 384);
    scrollTime(targetContainer, targetContainer.scrollLeft() - scrollBy);
  });

  $(".booking-time-scroll.right").on("click", function () {
    const targetContainer = $(this).prevAll(".booking-time-container").eq(0);
    const scrollBy = Math.min(targetContainer.outerWidth() - targetContainer.nextAll(".booking-time-scroll.left").eq(0).outerWidth() - targetContainer.nextAll(".booking-time-scroll.right").eq(0).outerWidth(), 384);
    scrollTime(targetContainer, targetContainer.scrollLeft() + scrollBy);
  });

  // handle service customisation forms

  function saveCustomisation(serviceNumber) {
    const formJQO = $(`#booking-service-customise-form-${serviceNumber}`);
    const fd = new FormData(formJQO[0]);
    const menuItemIds = fd.getAll("menu_item_id");
    const menuItemQtys = menuItemIds.map((n) => {
      const inputJQO = $(`#menu_item_qty_${serviceNumber}_${n}`);
      return inputJQO.attr("type") === "checkbox" ? (inputJQO.prop("checked") ? 1 : 0) : parseInt(inputJQO.val());
    });
    const selectedOptions = Object.fromEntries(menuItemIds.map((_, i) => [menuItemIds[i], menuItemQtys[i]]).filter(([_, qty]) => qty > 0));
    $(`#booking_service_${serviceNumber}`).val(JSON.stringify(selectedOptions));
    $(`#booking_service_${serviceNumber}`).prop("disabled", false);
    $(`.booking-service-item[data-service-id="${serviceNumber}"]`).find(".booking-service-customise-button-unselected").hide();
    $(`.booking-service-item[data-service-id="${serviceNumber}"]`).find(".booking-service-customise-button-selected").show();
  }

  function cancelCustomisation(serviceNumber) {
    const formJQO = $(`#booking-service-customise-form-${serviceNumber}`);
    formJQO.find(`[type="checkbox"]`).prop("checked", false);
    formJQO.find(`[type="number"]`).val(0);
    $(`#booking_service_${serviceNumber}`).removeAttr("value");
    $(`#booking_service_${serviceNumber}`).prop("disabled", true);
    $(`.booking-service-item[data-service-id="${serviceNumber}"]`).find(".booking-service-customise-button-unselected").show();
    $(`.booking-service-item[data-service-id="${serviceNumber}"]`).find(".booking-service-customise-button-selected").hide();
  }

  $(".booking-service-customise-confirm-button").on("click", function () {
    const serviceNumber = parseInt($(this).closest(".modal-content").find(".booking-service-customise-form").eq(0).attr("data-service-number"));
    saveCustomisation(serviceNumber);
  });

  $(".booking-service-customise-remove-button").on("click", function () {
    const serviceNumber = parseInt($(this).closest(".modal-content").find(".booking-service-customise-form").eq(0).attr("data-service-number"));
    cancelCustomisation(serviceNumber);
  });

  // validation for personal info inputs

  const emailRegexp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  function validate(fieldJQO) {
    const fieldID = fieldJQO.attr("id");
    let isValid;
    switch (fieldID) {
      case "title": isValid = !!fieldJQO.val(); break;
      case "fname": isValid = !!fieldJQO.val(); break;
      case "lname": isValid = !!fieldJQO.val(); break;
      case "email": isValid = fieldJQO.val().match(emailRegexp); break;
      case "phone": isValid = !!fieldJQO.val(); break;
      case "ack":   isValid = fieldJQO.prop("checked"); break;
      default:      isValid = false;
    }
    fieldJQO.toggleClass("invalid", !isValid);
    return isValid;
  }

  $(".validate-on-change").on("blur change", function () {
    validate($(this));
  });

  $(`.form-navigate[data-page="5"]`).on("click", function () {
    const validationStates = [...$(`.form-page[data-page="4"]`).find(".validate-on-change")].map((fieldHTMLO) => validate($(fieldHTMLO)));
    if (validationStates.includes(false)) {
      naviagteForm(4);
    }
  });

  // debug

  $("#booking-form").on("submit", function () {
    const fd = new FormData(this);
    console.table(Object.fromEntries(fd));
  });

});