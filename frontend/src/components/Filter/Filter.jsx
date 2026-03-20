import React, { useEffect, useMemo, useState } from 'react';
import './Filter.css';

const SIZE_OPTIONS = [
  { label: 'XXS', aliases: ['XXS', '2XS', 'XX-Small'] },
  { label: 'XS', aliases: ['XS', 'X-Small'] },
  { label: 'S', aliases: ['S', 'Small'] },
  { label: 'M', aliases: ['M', 'Medium'] },
  { label: 'L', aliases: ['L', 'Large'] },
  { label: 'XL', aliases: ['XL', 'X-Large'] },
  { label: 'XXL', aliases: ['XXL', '2XL', 'XX-Large'] },
  { label: '3XL', aliases: ['XXXL', '3XL', '3X-Large'] },
  { label: '4XL', aliases: ['XXXXL', '4XL', '4X-Large'] }
];

const FALLBACK_PRICE_BOUNDS = { min: 0, max: 20000 };

const normalize = (value) => String(value || '').trim();
const normalizeLower = (value) => normalize(value).toLowerCase();
const isHexColor = (value) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(normalize(value));
const toSliderPercent = (value, min, max) => {
  const spread = max - min;
  if (!Number.isFinite(spread) || spread <= 0) {
    return 0;
  }

  const ratio = ((value - min) / spread) * 100;
  return Math.min(100, Math.max(0, ratio));
};

function Filter({ products, onFilterChange }) {
  const priceBounds = useMemo(() => {
    const prices = [];
    products.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        const price = Number(variant?.price);
        if (Number.isFinite(price) && price >= 0) {
          prices.push(price);
        }
      });
    });

    if (!prices.length) {
      return FALLBACK_PRICE_BOUNDS;
    }

    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    if (min === max) {
      return {
        min: Math.max(0, min - 100),
        max: max + 100
      };
    }

    return { min, max };
  }, [products]);

  const numericSizes = useMemo(() => {
    const sizeSet = new Set();

    products.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        const size = normalize(variant?.size);
        if (/^\d+$/.test(size)) sizeSet.add(size);
      });
    });

    return Array.from(sizeSet).sort((a, b) => Number(a) - Number(b));
  }, [products]);

  const numericBounds = useMemo(() => {
    if (!numericSizes.length) return { min: 0, max: 0 };
    return {
      min: Number(numericSizes[0]),
      max: Number(numericSizes[numericSizes.length - 1])
    };
  }, [numericSizes]);

  const availableLetterSizes = useMemo(() => {
    const sizeSet = new Set();

    products.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        const variantSize = normalizeLower(variant?.size);
        const matched = SIZE_OPTIONS.find((item) =>
          (item.aliases || []).some((alias) => normalizeLower(alias) === variantSize)
        );
        if (matched) {
          sizeSet.add(matched.label);
        }
      });
    });

    const order = SIZE_OPTIONS.map((item) => item.label);
    return order.filter((label) => sizeSet.has(label));
  }, [products]);

  const allCategories = useMemo(() => {
    const categorySet = new Set();
    products.forEach((product) => {
      const category = normalize(product?.category);
      if (category) categorySet.add(category);
    });
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const allBrands = useMemo(() => {
    const brandSet = new Set();
    products.forEach((product) => {
      const brand = normalize(product?.brand);
      if (brand) brandSet.add(brand);
    });
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const allMaterials = useMemo(() => {
    const materialSet = new Set();
    products.forEach((product) => {
      const material = normalize(product?.material);
      if (material) materialSet.add(material);
    });
    // Remove 'StrainlessSteel', keep 'Stainless Steel'
    // Remove 'StrainlessSteel' and 'StainlessSteel', keep 'Stainless Steel'
    return Array.from(materialSet)
      .filter((mat) => {
        const lower = mat.toLowerCase();
        return lower !== 'strainlesssteel' && lower !== 'stainlesssteel';
      })
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  const allColors = useMemo(() => {
    const colorMap = new Map();

    products.forEach((product) => {
      (product.variants || []).forEach((variant) => {
        const colorName = normalize(variant?.color);
        const colorCode = variant?.colorCode || variant?.color;
        if (colorName) {
          colorMap.set(normalizeLower(colorName), {
            name: colorName,
            code: isHexColor(colorCode) ? colorCode : '#d1d5db'
          });
        }
      });
    });

    return Array.from(colorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const [priceRange, setPriceRange] = useState([priceBounds.min, priceBounds.max]);
  const [numericRange, setNumericRange] = useState([numericBounds.min, numericBounds.max]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  // Removed inStockOnly filter
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeExpanded, setSizeExpanded] = useState(false);
  const [colorsExpanded, setColorsExpanded] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [brandExpanded, setBrandExpanded] = useState(false);
  const [materialExpanded, setMaterialExpanded] = useState(false);

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    setNumericRange([numericBounds.min, numericBounds.max]);
  }, [numericBounds.min, numericBounds.max]);

  // Initialize with all products on first load
  useEffect(() => {
    if (products.length > 0) {
      onFilterChange(products);
    }
  }, [products]);

  const applyFilters = (
    nextPriceRange = priceRange,
    nextColors = selectedColors,
    nextCategories = selectedCategories,
    nextBrands = selectedBrands,
    nextMaterials = selectedMaterials,
    // Removed inStockOnly
    nextSizes = selectedSizes,
    nextNumericRange = numericRange
  ) => {
    const filtered = products.filter((product) => {
      const variants = product.variants || [];

      const priceMatch = variants.some((variant) => {
        const price = Number(variant?.price);
        return Number.isFinite(price) && price >= nextPriceRange[0] && price <= nextPriceRange[1];
      });

      const colorMatch =
        nextColors.length === 0 ||
        variants.some((variant) => nextColors.includes(normalize(variant?.color)));

      const categoryMatch =
        nextCategories.length === 0 ||
        nextCategories.includes(normalize(product?.category));

      const brandMatch =
        nextBrands.length === 0 ||
        nextBrands.map(normalizeLower).includes(normalizeLower(product?.brand));

      const materialMatch =
        nextMaterials.length === 0 ||
        nextMaterials.includes(normalize(product?.material));

      const sizeMatch =
        nextSizes.length === 0 ||
        variants.some((variant) => {
          const variantSize = normalizeLower(variant?.size);
          return nextSizes.some((selected) => {
            const rule = SIZE_OPTIONS.find((item) => item.label === selected);
            return (rule?.aliases || []).some((alias) => normalizeLower(alias) === variantSize);
          });
        });

      const numericMatch =
        numericSizes.length === 0 ||
        variants.some((variant) => {
          const numeric = Number(variant?.size);
          return Number.isFinite(numeric) && numeric >= nextNumericRange[0] && numeric <= nextNumericRange[1];
        });

      // Removed stockMatch
      return priceMatch && colorMatch && categoryMatch && brandMatch && materialMatch && sizeMatch && numericMatch;
    });

    onFilterChange(filtered);
  };

  const onPriceChange = (value, which) => {
    const nextValue = Number(value);
    const next = which === 'min'
      ? [Math.min(nextValue, priceRange[1]), priceRange[1]]
      : [priceRange[0], Math.max(nextValue, priceRange[0])];

    setPriceRange(next);
    applyFilters(next);
  };

  const onNumericRangeChange = (value, which) => {
    const rawValue = Number(value);
    const snapped = numericSizes.length
      ? numericSizes.reduce((closest, size) => {
          const numeric = Number(size);
          return Math.abs(numeric - rawValue) < Math.abs(closest - rawValue) ? numeric : closest;
        }, Number(numericSizes[0]))
      : rawValue;

    const next = which === 'min'
      ? [Math.min(snapped, numericRange[1]), numericRange[1]]
      : [numericRange[0], Math.max(snapped, numericRange[0])];

    setNumericRange(next);
    applyFilters(priceRange, selectedColors, selectedCategories, selectedBrands, selectedMaterials, inStockOnly, selectedSizes, next);
  };

  const toggleColor = (colorName) => {
    const next = selectedColors.includes(colorName)
      ? selectedColors.filter((entry) => entry !== colorName)
      : [...selectedColors, colorName];

    setSelectedColors(next);
    applyFilters(priceRange, next);
  };

  const toggleCategory = (category) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((entry) => entry !== category)
      : [...selectedCategories, category];

    setSelectedCategories(next);
    applyFilters(priceRange, selectedColors, next);
  };

  const toggleBrand = (brand) => {
    const normalizedBrand = normalizeLower(brand);
    const next = selectedBrands.map(normalizeLower).includes(normalizedBrand)
      ? selectedBrands.filter((entry) => normalizeLower(entry) !== normalizedBrand)
      : [...selectedBrands, brand];

    setSelectedBrands(next);
    applyFilters(priceRange, selectedColors, selectedCategories, next, selectedMaterials, inStockOnly, selectedSizes, numericRange);
  };

  const toggleMaterial = (material) => {
    const next = selectedMaterials.includes(material)
      ? selectedMaterials.filter((entry) => entry !== material)
      : [...selectedMaterials, material];

    setSelectedMaterials(next);
    applyFilters(priceRange, selectedColors, selectedCategories, selectedBrands, next);
  };

  // Removed toggleInStockOnly

  const toggleSize = (label) => {
    const next = selectedSizes.includes(label)
      ? selectedSizes.filter((entry) => entry !== label)
      : [...selectedSizes, label];

    setSelectedSizes(next);
    applyFilters(priceRange, selectedColors, selectedCategories, next);
  };

  const resetFilters = () => {
    const resetPrice = [priceBounds.min, priceBounds.max];
    const resetNumeric = [numericBounds.min, numericBounds.max];

    setPriceRange(resetPrice);
    setNumericRange(resetNumeric);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedMaterials([]);
    // Removed inStockOnly reset
    setSelectedSizes([]);
    onFilterChange(products);
  };

  const hasActiveFilters =
    selectedColors.length > 0 ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedMaterials.length > 0 ||
    // Removed inStockOnly from hasActiveFilters
    selectedSizes.length > 0 ||
    priceRange[0] !== priceBounds.min ||
    priceRange[1] !== priceBounds.max ||
    numericRange[0] !== numericBounds.min ||
    numericRange[1] !== numericBounds.max;

  const priceTrackStyle = {
    '--range-start': `${toSliderPercent(priceRange[0], priceBounds.min, priceBounds.max)}%`,
    '--range-end': `${toSliderPercent(priceRange[1], priceBounds.min, priceBounds.max)}%`
  };

  const numericTrackStyle = {
    '--range-start': `${toSliderPercent(numericRange[0], numericBounds.min, numericBounds.max)}%`,
    '--range-end': `${toSliderPercent(numericRange[1], numericBounds.min, numericBounds.max)}%`
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button className="reset-filters-btn" type="button" onClick={resetFilters}>Reset</button>
        )}
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range-display">₹{priceRange[0]} - ₹{priceRange[1]}</div>
        <div className="price-boundary-labels">
          <span>Min: ₹{priceBounds.min}</span>
          <span>Max: ₹{priceBounds.max}</span>
        </div>
        <div className="range-slider-wrap" style={priceTrackStyle}>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={priceRange[0]}
            onChange={(event) => onPriceChange(event.target.value, 'min')}
            className="range-slider"
          />
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={priceRange[1]}
            onChange={(event) => onPriceChange(event.target.value, 'max')}
            className="range-slider"
          />
        </div>
      </div>

      <div className="filter-section">
        <button type="button" className="size-heading-button" onClick={() => setColorsExpanded((prev) => !prev)}>
          <h4>Colors</h4>
          <span className={`size-arrow ${colorsExpanded ? 'open' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: colorsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
              <path d="M5 7l4 4 4-4" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {colorsExpanded && (
          <div className="size-blocks-wrap">
            <div className="size-subsection">
              {allColors.length === 0 ? (
                <p className="filter-empty-text">No colors available</p>
              ) : (
                <div className="facet-list">
                  {allColors.map(({ name, code }) => (
                    <button
                      key={name}
                      type="button"
                      className={`facet-row ${selectedColors.includes(name) ? 'active' : ''}`}
                      onClick={() => toggleColor(name)}
                    >
                      <span className="facet-left">
                        <span className="facet-swatch" style={{ backgroundColor: code }}></span>
                        <span>{name}</span>
                      </span>
                      {selectedColors.includes(name) ? <span className="facet-check">✓</span> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {allCategories.length > 0 && (
        <div className="filter-section">
          <button type="button" className="size-heading-button" onClick={() => setCategoryExpanded((prev) => !prev)}>
            <h4>Category</h4>
            <span className={`size-arrow ${categoryExpanded ? 'open' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: categoryExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
                <path d="M5 7l4 4 4-4" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {categoryExpanded && (
            <div className="size-blocks-wrap">
              <div className="size-subsection">
                <div className="facet-list">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`facet-row ${selectedCategories.includes(category) ? 'active' : ''}`}
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="facet-left">{category}</span>
                      {selectedCategories.includes(category) ? <span className="facet-check">✓</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {allBrands.length > 0 && (
        <div className="filter-section">
          <button type="button" className="size-heading-button" onClick={() => setBrandExpanded((prev) => !prev)}>
            <h4>Brand</h4>
            <span className={`size-arrow ${brandExpanded ? 'open' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: brandExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
                <path d="M5 7l4 4 4-4" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {brandExpanded && (
            <div className="size-blocks-wrap">
              <div className="size-subsection">
                <div className="facet-list">
                  {allBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      className={`facet-row ${selectedBrands.includes(brand) ? 'active' : ''}`}
                      onClick={() => toggleBrand(brand)}
                    >
                      <span className="facet-left">{brand}</span>
                      {selectedBrands.includes(brand) ? <span className="facet-check">✓</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {allMaterials.length > 0 && (
        <div className="filter-section">
          <button type="button" className="size-heading-button" onClick={() => setMaterialExpanded((prev) => !prev)}>
            <h4>Material</h4>
            <span className={`size-arrow ${materialExpanded ? 'open' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: materialExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
                <path d="M5 7l4 4 4-4" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {materialExpanded && (
            <div className="size-blocks-wrap">
              <div className="size-subsection">
                <div className="facet-list">
                  {allMaterials.map((material) => (
                    <button
                      key={material}
                      type="button"
                      className={`facet-row ${selectedMaterials.includes(material) ? 'active' : ''}`}
                      onClick={() => toggleMaterial(material)}
                    >
                      <span className="facet-left">{material}</span>
                      {selectedMaterials.includes(material) ? <span className="facet-check">✓</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Removed In Stock Only filter section */}

      <div className="filter-section">
        <button type="button" className="size-heading-button" onClick={() => setSizeExpanded((prev) => !prev)}>
          <h4>Size</h4>
          <span className={`size-arrow ${sizeExpanded ? 'open' : ''}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: sizeExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
              <path d="M5 7l4 4 4-4" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {sizeExpanded && (
          <div className="size-blocks-wrap">
            {availableLetterSizes.length > 0 && (
              <div className="size-subsection">
                <p className="size-subheading">Sizes</p>
                <div className="size-filter-grid letter-grid">
                  {availableLetterSizes.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`size-filter-option ${selectedSizes.includes(label) ? 'active' : ''}`}
                    onClick={() => toggleSize(label)}
                  >
                    {label}
                  </button>
                ))}
                </div>
              </div>
            )}

            {numericSizes.length > 0 && (
              <div className="size-subsection">
                <p className="size-subheading">Numeric Sizes ({numericRange[0]} - {numericRange[1]})</p>
                <div className="range-slider-wrap" style={numericTrackStyle}>
                  <input
                    type="range"
                    min={numericBounds.min}
                    max={numericBounds.max}
                    value={numericRange[0]}
                    onChange={(event) => onNumericRangeChange(event.target.value, 'min')}
                    className="range-slider"
                  />
                  <input
                    type="range"
                    min={numericBounds.min}
                    max={numericBounds.max}
                    value={numericRange[1]}
                    onChange={(event) => onNumericRangeChange(event.target.value, 'max')}
                    className="range-slider"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(selectedColors.length > 0 || selectedCategories.length > 0 || selectedBrands.length > 0 || selectedMaterials.length > 0 || selectedSizes.length > 0) && (
        <div className="selected-tags">
          {selectedColors.map((entry) => (
            <span key={`color-${entry}`} className="tag">
              {entry}
              <button type="button" className="tag-close" onClick={() => toggleColor(entry)}>×</button>
            </span>
          ))}

          {selectedCategories.map((entry) => (
            <span key={`category-${entry}`} className="tag">
              {entry}
              <button type="button" className="tag-close" onClick={() => toggleCategory(entry)}>×</button>
            </span>
          ))}

          {selectedBrands.map((entry) => (
            <span key={`brand-${entry}`} className="tag">
              {entry}
              <button type="button" className="tag-close" onClick={() => toggleBrand(entry)}>×</button>
            </span>
          ))}

          {selectedMaterials.map((entry) => (
            <span key={`material-${entry}`} className="tag">
              {entry}
              <button type="button" className="tag-close" onClick={() => toggleMaterial(entry)}>×</button>
            </span>
          ))}

          {selectedSizes.map((entry) => (
            <span key={`size-${entry}`} className="tag">
              {entry}
              <button type="button" className="tag-close" onClick={() => toggleSize(entry)}>×</button>
            </span>
          ))}

          {/* Removed inStockOnly tag */}
        </div>
      )}
    </div>
  );
}

export default Filter;
