import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import AddCar from "./components/AddCar";
import ManageCar from "./components/ManageCar";

const App = () => {


  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<AddCar />}></Route>
        <Route path="/manage-car" element={<ManageCar/>}></Route>
      </Routes>
    </div>
  );
};

export default App;
