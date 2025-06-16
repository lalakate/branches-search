import React, { useState, useRef } from "react";
import '../styles/SearchForm.css'
import { type SearchFormProps } from "../searchFormProps/searchFormProps";

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  regions,
  citiesByRegion,
  allCities,
  services,
}) => {
  const [regionInput, setRegionInput] = useState("");
  const [region, setRegion] = useState("");
  const [regionFocused, setRegionFocused] = useState(false);
  const [regionActiveIndex, setRegionActiveIndex] = useState<number>(-1);
  const regionInputRef = useRef<HTMLInputElement>(null);
  const regionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityFocused, setCityFocused] = useState(false);
  const [cityActiveIndex, setCityActiveIndex] = useState<number>(-1);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [service, setService] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [serviceActiveIndex, setServiceActiveIndex] = useState(-1);
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const serviceRefs = useRef<(HTMLLIElement | null)[]>([]);

  const filteredRegions = regions.filter((r) =>
    r.toLowerCase().includes(regionInput.toLowerCase())
  );

  const cityList = region
    ? Array.from(citiesByRegion[region] || []).filter((city) => city !== ".")
    : (allCities || []).filter((city) => city !== ".");

  const filteredCities = cityList.filter((c) =>
    c.toLowerCase().includes(cityInput.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.toLowerCase().includes(service.toLowerCase())
  );

  const handleRegionSelect = (regionName: string) => {
    setRegion(regionName);
    setRegionInput(regionName);
    setRegionFocused(false);
    setRegionActiveIndex(-1);
  };

  const handleCitySelect = (c: string) => {
    setCity(c);
    setCityInput(c);
    setCityFocused(false);
    setCityActiveIndex(-1);
    cityInputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cityValue = city || cityInput;
    const regionValue = region || regionInput;
    onSearch({
      city: cityValue,
      region: regionValue,
      wifi,
      equeue,
      service,
      worksNow,
      worksOnWeekend,
      is24Hours: is24,
    });
  };

  const [wifi, setWifi] = useState(false);
  const [equeue, setEqueue] = useState(false);
  const [worksNow, setWorksNow] = useState(false);
  const [worksOnWeekend, setWorksOnWeekend] = useState(false);
  const [is24, setIs24] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="search-form" autoComplete="off">
      <div className="inputs">
      <div className="region-input">
        <input
          ref={regionInputRef}
          type="text"
          placeholder="Область"
          value={regionInput}
          className="input"
          onChange={e => {
            setRegionInput(e.target.value);
            if (region) setRegion("");
            setRegionFocused(true);
            setRegionActiveIndex(-1);
          }}
          onFocus={() => {
            setRegionInput("");
            setRegion("");
            setRegionFocused(true);
            setRegionActiveIndex(-1);
          }}
          onBlur={() => setTimeout(() => setRegionFocused(false), 100)}
          onKeyDown={e => {
            if (regionFocused && filteredRegions.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setRegionActiveIndex(prev => {
                  const next = prev < filteredRegions.length - 1 ? prev + 1 : 0;
                  setTimeout(() => {
                    regionRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setRegionActiveIndex(prev => {
                  const next = prev > 0 ? prev - 1 : filteredRegions.length - 1;
                  setTimeout(() => {
                    regionRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (
                  regionActiveIndex >= 0 &&
                  regionActiveIndex < filteredRegions.length
                ) {
                  handleRegionSelect(filteredRegions[regionActiveIndex]);
                } else if (filteredRegions.length > 0) {
                  handleRegionSelect(filteredRegions[0]);
                }
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {regionFocused && filteredRegions.length > 0 && (
          <ul className="dropdown-list">
            {filteredRegions.map((r, idx) => (
              <li
                key={r}
                ref={el => {regionRefs.current[idx] = el}}
                className="dropdown-item"
                style={{
                  background: idx === regionActiveIndex ? "#96c998" : "#fff",
                  cursor: "pointer",
                }}
                onMouseDown={() => handleRegionSelect(r)}
                onMouseEnter={() => setRegionActiveIndex(idx)}
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Город */}
      <div className="region-input">
        <input
          ref={cityInputRef}
          type="text"
          placeholder="Город"
          value={cityInput}
          className="input"
          disabled={!region && !allCities?.length}
          onChange={e => {
            setCityInput(e.target.value);
            if (city) setCity("");
            setCityFocused(true);
            setCityActiveIndex(-1);
          }}
          onFocus={() => {
            setCityInput("");
            setCity("");
            setCityFocused(true);
            setCityActiveIndex(-1);
          }}
          onBlur={() => setTimeout(() => setCityFocused(false), 100)}
          onKeyDown={e => {
            if (cityFocused && filteredCities.length > 0 && !city) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCityActiveIndex(prev => {
                  const next = prev < filteredCities.length - 1 ? prev + 1 : 0;
                  setTimeout(() => {
                    cityRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCityActiveIndex(prev => {
                  const next = prev > 0 ? prev - 1 : filteredCities.length - 1;
                  setTimeout(() => {
                    cityRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (
                  cityActiveIndex >= 0 &&
                  cityActiveIndex < filteredCities.length
                ) {
                  handleCitySelect(filteredCities[cityActiveIndex]);
                } else if (filteredCities.length > 0) {
                  handleCitySelect(filteredCities[0]);
                }
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {(cityFocused && !city) && (
          <ul className="dropdown-list">
            {filteredCities.map((c, idx) => (
              <li
                key={c}
                ref={el => {cityRefs.current[idx] = el}}
                className="dropdown-item"
                style={{
                  background: idx === cityActiveIndex ? "#96c998" : "#fff",
                  cursor: "pointer",
                }}
                onMouseDown={() => handleCitySelect(c)}
                onMouseEnter={() => setCityActiveIndex(idx)}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
      <div className="service-select" >
        <input
          ref={serviceInputRef}
          type="text"
          placeholder="Услуга"
          value={service}
          className="input"
          readOnly
          onFocus={() => {
            if (service) {
              setService(""); // очищаем при фокусе, если уже выбрано
            }
            setServiceDropdownOpen(true);
            setServiceActiveIndex(-1);
          }}
          onBlur={() => setTimeout(() => setServiceDropdownOpen(false), 100)}
          onKeyDown={e => {
            if (serviceDropdownOpen && filteredServices.length > 0) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setServiceActiveIndex(prev => {
                  const next = prev < filteredServices.length - 1 ? prev + 1 : 0;
                  setTimeout(() => {
                    serviceRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setServiceActiveIndex(prev => {
                  const next = prev > 0 ? prev - 1 : filteredServices.length - 1;
                  setTimeout(() => {
                    serviceRefs.current[next]?.scrollIntoView({ block: "nearest" });
                  }, 0);
                  return next;
                });
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (serviceActiveIndex >= 0 && serviceActiveIndex < filteredServices.length) {
                  setService(filteredServices[serviceActiveIndex]);
                  setServiceDropdownOpen(false);
                } else if (filteredServices.length > 0) {
                  setService(filteredServices[0]);
                  setServiceDropdownOpen(false);
                }
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />

        {serviceDropdownOpen && filteredServices.length > 0 && (
          <ul className="dropdown-list">
            {filteredServices.map((s, idx) => (
              <li
                key={s}
                ref={el => {serviceRefs.current[idx] = el}}
                className="dropdown-item"
                style={{
                  background: idx === serviceActiveIndex ? "#96c998" : "#fff",
                  cursor: "pointer",
                }}
                onMouseDown={() => {
                  setService(s);
                  setServiceDropdownOpen(false);
                }}
                onMouseEnter={() => setServiceActiveIndex(idx)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="checkboxes-container">
      <label className="wifi-checkbox" style={{ userSelect: "none" }}>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            checked={wifi}
            onChange={e => setWifi(e.target.checked)}
          />
          <span className="checkmark"></span>
        </span>
        Wi-Fi
      </label>

      <label className="equeue-checkbox" style={{ userSelect: "none" }}>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            checked={equeue}
            onChange={e => setEqueue(e.target.checked)}
          />
          <span className="checkmark"></span>
        </span>
        Электронная очередь
      </label>

      <label className="work-now-checkbox" style={{ userSelect: "none" }}>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            checked={worksNow}
            onChange={e => setWorksNow(e.target.checked)}
          />
          <span className="checkmark"></span>
        </span>
        Работает сейчас
      </label>

      <label className="work-weekend-checkbox" style={{ userSelect: "none" }}>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            checked={worksOnWeekend}
            onChange={e => setWorksOnWeekend(e.target.checked)}
          />
          <span className="checkmark"></span>
        </span>
        Работает в выходные
      </label>

      <label className="always-open-checkbox" style={{ userSelect: "none" }}>
        <span className="custom-checkbox">
          <input
            type="checkbox"
            checked={is24}
            onChange={e => setIs24(e.target.checked)}
          />
          <span className="checkmark"></span>
        </span>
        Работает до 24
      </label>
      </div>
      <button type="submit" className="submit-button">
        Найти
      </button>
    </form>
  );
};
