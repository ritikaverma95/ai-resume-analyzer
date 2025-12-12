import React from "react";
import { Link } from "react-router";

const Navbar = () =>{
    return (
        <nav className="navbar"> 
        <Link to="/">
            <p className="text-2xl font-bold text-gradent text-black p-2 m-2"> RESUMIND</p>
        </Link>
         <Link to="/upload" className="primary-button w-fit text-black p-2 m-2">
         Upload Resume
         </Link>
        </nav>
    )
}
export default Navbar;