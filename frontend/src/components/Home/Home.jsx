import React from 'react';
import MenuIcon from '../../assets/burger-menu.svg?react';
import Search from '../../assets/search-button.svg?react';
import Cart from '../../assets/shopping-cart.svg?react';
import Product from '../Product/Product'
import '../Home/Home.css'
function Home(){
    return (
            <div>
                
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
            <Product/>
            </div>
        
    )
}
export default Home;