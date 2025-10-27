import React, { useEffect, useState } from "react";
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom";
import AddHotels from "./AddHotels";
import MyHotels from "./MyHotels";

const Accommodation = () => {

  const [ShowAddHotels, setShowAddHotels] = useState(false); //hotels Creation modal


  return (
    <div>
      <div className="grid items-center grid-cols-2">
        <div>
          <img src={logo} alt="" className="w-45" />
        </div>
        <div className="flex gap-10 justify-self-end mr-10">
          <button className="nav-button" onClick={() => setShowAddHotels(!ShowAddHotels)} >ADD HOTELS</button>
          <button className="nav-button">RESERVATION</button>
          <button className="nav-button">PROFILE</button>
        </div>
      </div>
      <div className="text-center text-2xl mt-1.5">
      <h1>My Accomodation</h1>
      </div>
   {ShowAddHotels && (
  <AddHotels
    onHotelAdded={() => fetchHotels()}
    onClose={() => setShowAddHotels(false)}
  />
)}

    <MyHotels/>
    </div>
  );
};

export default Accommodation;
