import { useState, useRef, useEffect } from 'react';
import { dataCenters } from '../../data/worlds';
import '../WorldSelector/WorldSelector';

interface WorldSelectorProps {
  value: string;
  onChange: (world: string) => void;
  placeholder?: string;
}

function WorldSelector({ value, onChange, placeholder = 'Select a world...' }: WorldSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('North America');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleWorldSelect(world: string) {
    onChange(world);
    setIsOpen(false);
    setSearchQuery('');
  }

  // Filter worlds based on search query
  function getFilteredWorlds() {
    const query = searchQuery.toLowerCase();
    if (!query) return dataCenters;

    const filtered: typeof dataCenters = {};
    Object.entries(dataCenters).forEach(([region, dcs]) => {
      const filteredDCs = dcs
        .map(dc => ({
          ...dc,
          worlds: dc.worlds.filter(world => 
            world.toLowerCase().includes(query) ||
            dc.name.toLowerCase().includes(query)
          )
        }))
        .filter(dc => dc.worlds.length > 0);

      if (filteredDCs.length > 0) {
        filtered[region] = filteredDCs;
      }
    });

    return filtered;
  }

  const filteredData = getFilteredWorlds();
  const regions = Object.keys(filteredData);

  return (
    <div className="world-selector" ref={dropdownRef}>
      <button
        type="button"
        className="world-selector__button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="world-selector__value">
          {value || placeholder}
        </span>
        <span className="world-selector__arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="world-selector__dropdown">
          {/* Search Input */}
          <div className="world-selector__search">
            <input
              type="text"
              placeholder="Search worlds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="world-selector__search-input"
              autoFocus
            />
          </div>

          {/* Region Tabs */}
          <div className="world-selector__tabs">
            {regions.map(region => (
              <button
                key={region}
                type="button"
                className={`world-selector__tab ${selectedRegion === region ? 'world-selector__tab--active' : ''}`}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Data Centers and Worlds */}
          <div className="world-selector__content">
            {filteredData[selectedRegion]?.map(dc => (
              <div key={dc.name} className="world-selector__datacenter">
                <h4 className="world-selector__datacenter-name">{dc.name}</h4>
                <div className="world-selector__worlds">
                  {dc.worlds.map(world => (
                    <button
                      key={world}
                      type="button"
                      className={`world-selector__world ${value === world ? 'world-selector__world--selected' : ''}`}
                      onClick={() => handleWorldSelect(world)}
                    >
                      {world}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldSelector;