"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const FoodCarousel = () => (
  <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-lg">
    <Carousel
      autoPlay
      infiniteLoop
      showStatus={false}
      showIndicators={false}
      showThumbs={false}
      interval={3000}
      swipeable
      emulateTouch
      className="rounded-2xl"
    >
      <div className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[400px]">
        <img
          src="/images/img1.jpg"
          alt="Delicious Home Meal"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[400px]">
        <img
          src="/images/img2.jpg"
          alt="Tasty Thali"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[400px]">
        <img
          src="/images/img3.jpg"
          alt="Healthy Veg Platter"
          className="w-full h-full object-cover"
        />
      </div>
    </Carousel>
  </div>
);

export default FoodCarousel;
