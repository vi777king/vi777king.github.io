//= ../../bower_components/Jquery/dist/jquery.js
//= ../../bower_components/slick-carousel/slick/slick.min.js

$(".slider-items").slick({
  appendArrows: $(".slider"),
  nextArrow: $(".slider__next-arrow"),
  prevArrow: $(".slider__prev-arrow"),
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        dots: false
      }
    },
    {
      breakpoint: 641,
      settings: {
        arrows: false
      }
    }
  ]
});
