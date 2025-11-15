import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import AddCar from "./components/AddCar";
import ManageCar from "./components/ManageCar";
import Booking from "./components/Booking";

const App = () => {


  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<AddCar />}></Route>
        <Route path="/manage-cars" element={<ManageCar/>}></Route>
        <Route path="/bookings" element={<Booking/>}></Route>
      </Routes>
    </div>
  );
};

export default App;
