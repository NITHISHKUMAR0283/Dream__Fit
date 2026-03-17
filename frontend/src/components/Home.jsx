import React from 'react';
import MenuIcon from '../assets/burger-menu.svg?react';
import Search from '../assets/search-button.svg?react';
import Cart from '../assets/shopping-cart.svg?react';
import '../components/Home.css'
import { Link } from 'react-router-dom';
function Home(){
    return (
        
            <nav id="Nav-Bar">
                <div id="left">
                    <MenuIcon className= "my-burger-style"/>
                    <div id = "CompanyName">RIYANSHBABA</div>    
                    <p className='hide-on-small'>NewArrivals</p>
                </div>
                <div id="right">
                <div id="Search">
                    
                    <Search className="search_icon"/>
                    <input id="Input" type="text" />
                    
                </div>
                <Cart className ="Cart"/>
                </div>     
            </nav>
        
    )
}
export default Home;