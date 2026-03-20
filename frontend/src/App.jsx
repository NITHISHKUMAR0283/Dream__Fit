import React from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Product from './components/Product/Product'
import MenuIcon from './assets/burger-menu.svg?react';
import Search from './assets/search-button.svg?react';
import Cart from './assets/shopping-cart.svg?react';
import IndividualProduct from './components/individual/individual'
import CartPage from './components/cart/CartPage';
import Footer from './components/Footer/Footer';
import { useCart } from './context/CartContext';
import './App.css'
function App(){
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <div className="app-shell">
            <nav id="Nav-Bar">
                <div id="left">
                    <button type="button" className="burger-button" onClick={() => setMenuOpen((prev) => !prev)}>
                        <MenuIcon className= "my-burger-style"/>
                    </button>
                    <Link to="/" id = "CompanyName">RIYANSHBABA</Link>
                    <Link to="/new-arrivals" className='hide-on-small nav-link'>NewArrivals</Link>
                </div>
                <div id="right">
                <div id="Search">
                    
                    <Search className="search_icon"/>
                    <input id="Input" type="text" />
                    
                </div>
                <button type="button" className="cart-button" onClick={() => navigate('/cart')}>
                    <Cart className ="Cart"/>
                    {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </button>
                </div>    

            </nav>

            {menuOpen && <button type="button" className="menu-overlay" onClick={closeMenu} aria-label="Close menu" />}
            <aside className={`menu-drawer ${menuOpen ? "open" : ""}`}>
                <Link to="/" className="menu-link" onClick={closeMenu}>Home</Link>
                <Link to="/new-arrivals" className="menu-link" onClick={closeMenu}>New Arrivals</Link>
                <Link to="/cart" className="menu-link" onClick={closeMenu}>Cart</Link>
            </aside>

            <main className="app-main">
                <Routes>
                    <Route path="/" element={<Product/>}></Route>
                    <Route path="/new-arrivals" element={<Product limit={50} sort="latest"/>}></Route>
                    <Route path="/product/:id" element={<IndividualProduct/>}></Route> 
                    <Route path="/cart" element={<CartPage/>}></Route> 
                </Routes>
            </main>

            <Footer/>
            </div>
        
            
        
        
    )
}
export default App;