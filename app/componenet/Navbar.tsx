import React, { Component } from "react";
import { Link } from "react-router";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link to={"/"}>
          <p className = "text-2xl font-bold text-gradient">RESUMIND</p>
        </Link>
        <Link to={"/upload"} className="primary-button w-fit">
          Upload Resume
        </Link>
      </nav>
    );
  }
}

export default Navbar;
