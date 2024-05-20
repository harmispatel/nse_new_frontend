import { Link } from "react-router-dom";
import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";


const NavbarMenu = () => {
  const navigate = useNavigate();
  const logout = async () => { 
    AuthService.logout_user()
    .then(()=>{ 
      localStorage.removeItem("token")
      navigate("/login");
    }).catch(e => { 
      localStorage.removeItem("token")
      navigate("/login");
    })
  }

  return (
    <Container>
      <Navbar bg="Light" expand="lg" className="navbar navbar-light bg-light">
        <Navbar.Brand to="/">NSE DATA</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Link
              style={{ textDecoration: "none" }}
              className="nav-students"
              to="/"
            >
              HOME
            </Link>
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/bank-nifty"
            >
              BANKNIFTY
            </Link>
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/nifty-50"
            >
              NIFTY
            </Link>
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/item"
            >
              NSE
            </Link>
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/pcr"
            >
              PCR 
            </Link>
            {/* <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/admin-live"
            >
              ADMIN
            </Link> */}
            {/* <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/admin-bank-nifty"
            >
              Admin-BANKNIFTY
            </Link>
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              to="/admin-nifty-50"
            >
              Admin-NIFTY
            </Link> */}
            <Link
              style={{ textDecoration: "none" }}
              className="nav-addStudents"
              onClick={logout}
            >
              LOGOUT
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default NavbarMenu;
