import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function MachineParametersCard({ machines, selected, onSelect }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="px-4 p-5 mr-10 ml-10">
      <Slider {...settings}>
        {machines.map((machine, index) => (
          <div key={index} className="px-2">
            <button
              onClick={() => onSelect(index)}
              className={`w-full h-30 rounded-2x1 shadow-md flex items-center justify-center p-5 text-center 
              text-sm sm:text-base px-2 transition-all duration-300
              ${
                selected === index
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105 shadow-lg"
                  : "bg-gray-50 hover:bg-blue-100 text-gray-800"
              }`}
              style={{
                wordWrap: "break-word",
                lineHeight: "1.4",
              }}
            >
              {machine}
            </button>
          </div>
        ))}
      </Slider>
    </div>
  );
}
