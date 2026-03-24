// Simple order confirmed page
function OrderConfirmedPage() {
    return (
        <div className="order-confirmed-page">
            <div className="order-confirmed-card">
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase. Your order has been placed and will be delivered soon.</p>
                <Link to="/">Back to Home</Link>
            </div>
        </div>
    );
}
import React from 'react';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';


import Product from './components/Product/Product';
import MenuIcon from './assets/burger-menu.svg?react';
import Search from './assets/search-button.svg?react';
import Cart from './assets/shopping-cart.svg?react';
import IndividualProduct from './components/individual/individual';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './components/cart/CheckoutPage';
import Footer from './components/Footer/Footer';
import { useCart } from './context/CartContext';
import './App.css';


function App(){
    const navigate = useNavigate();
    const location = useLocation();
    const { totalItems } = useCart();
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const closeMenu = () => setMenuOpen(false);

    const handleSearchKeyDown = (event) => {
        if (event.key === "Enter") {
            navigate('/');
            closeMenu();
        }
    };

    return (
        <div className="app-shell">
            <nav id="Nav-Bar">
                <div id="left">
                    <button type="button" className="burger-button" onClick={() => setMenuOpen((prev) => !prev)}>
                        <MenuIcon className= "my-burger-style"/>
                    </button>
                                        <Link to="/" id="CompanyName" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                                <span style={{
                                                    fontFamily: 'Inter, Segoe UI, Arial, Helvetica, sans-serif',
                                                    fontWeight: 800,
                                                    fontSize: 28,
                                                    color: '#222',
                                                    letterSpacing: 1,
                                                    textShadow: '0 2px 8px #f1f1f1',
                                                    lineHeight: 1
                                                }}>Dream<span style={{ color: '#ec4899' }}>Fit</span></span>
                                        </Link>
                    <Link to="/new-arrivals" className='hide-on-small nav-link'>NewArrivals</Link>
                    {/* Home button: show only if not on homepage */}
                    {location.pathname !== '/' && (
                        <Link to="/" className="nav-link home-btn">Home</Link>
                    )}
                    {/* Cart button: show only if not on cart page */}
                    {location.pathname !== '/cart' && (
                        <Link to="/cart" className="nav-link cart-btn">Cart</Link>
                    )}
                </div>
                <div id="right">
                <div id="Search">
                    <Search className="search_icon"/>
                    <input
                        id="Input"
                        type="text"
                        placeholder="Search by product, brand, category..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
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
                    <Route path="/" element={<Product searchQuery={searchQuery} />}></Route>
                    <Route path="/new-arrivals" element={<Product limit={50} sort="latest" searchQuery={searchQuery} />}></Route>
                    <Route path="/product/:id" element={<IndividualProduct/>}></Route> 
                    <Route path="/cart" element={<CartPage/>}></Route> 
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
                </Routes>


            </main>

            <Footer/>
            </div>
        
            
        
        
    )
}
export default App;