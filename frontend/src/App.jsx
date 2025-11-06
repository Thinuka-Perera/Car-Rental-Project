import React from "react";
import {Route,Routes} from "react-router-dom"
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ContactPage from "./pages/ContactPage";

const App = () => {
  return (
    <>

        <Routes>
          <Route path = "/" element = {<Home/>} />
          <Route path="/login" element = {<Login/>}/>
          <Route path="/signup" element = {<Signup/>}/>
          <Route path="/contact" element = {<ContactPage/>}/>
        </Routes>


    </>
  );
};

export default App;
