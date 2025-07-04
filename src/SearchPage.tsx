import { useEffect, useState, useRef } from "react";
import { SearchForm } from "./components/SearchForm";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "./App.css";
import "./styles/loader.css";
import { type Branch } from "./types/branches";
import { majorCities } from "./types/map";
import { getMobileNumber, getWorkTime, isBranchOpenNow, worksOnWeekend, getLunchTime, formatStreetName } from "./types/information";

function SearchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filtered, setFiltered] = useState<Branch[]>([]);
  const [citiesByRegion, setCities] = useState<Record<string, Set<string>>>({});
  const [allCities, setAllCities] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [branchServices, setBranchServices] = useState<Record<string, Record<string, string[]>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const mapRef = useRef<any>(null);

  function logRequest(url: string) {
    const now = new Date();
    console.log(
      `[${now.toLocaleString()}] Запрос: ${url}`
    );
  }

  useEffect(() => {
    const branchesUrl = "/api/open-banking/v1.0/banks/AKBBBY2X/branches?size=1300";
    const servicesUrl = "/api/open-banking/v1.0/banks/AKBBBY2X/services";
    logRequest(branchesUrl);
    logRequest(servicesUrl);
    Promise.all([
      fetch(branchesUrl).then(res => res.json()),
      fetch(servicesUrl).then(res => res.json()),
    ])
      .then(([branchesRes, servicesRes]) => {
        const branchesData = branchesRes.data;
        setBranches(branchesData);
        setFiltered(branchesData);

        const citiesByRegion: Record<string, Set<string>> = {};
        const allCitiesSet = new Set<string>();
        branchesData.forEach((b: Branch) => {
          const region = b.postalAddress.countrySubDivision;
          const city = b.postalAddress.townName;
          if (region && city) {
            if (!citiesByRegion[region]) citiesByRegion[region] = new Set();
            citiesByRegion[region].add(city);
            allCitiesSet.add(city);
          }
        });
        setCities(citiesByRegion);
        setAllCities(Array.from(allCitiesSet));

        const serviceCategories: Record<string, { name: string; branches: string[] }[]> = {};
        const branchServicesMap: Record<string, Record<string, string[]>> = {};
        const allServicesSet = new Set<string>();

        for (const serviceGroup of servicesRes.data) {
          const category = serviceGroup.name;
          serviceCategories[category] = serviceGroup.service;
          for (const service of serviceGroup.service) {
            allServicesSet.add(service.name); 
            for (const branchId of service.branches) {
              if (!branchServicesMap[branchId]) branchServicesMap[branchId] = {};
              if (!branchServicesMap[branchId][category]) branchServicesMap[branchId][category] = [];
              branchServicesMap[branchId][category].push(service.name);
            }
          }
        }
        setBranchServices(branchServicesMap);
        setServices(Array.from(allServicesSet));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isVisible = window.scrollY > 100;
      if (isVisible !== isScrollButtonVisible)
        setIsScrollButtonVisible(isVisible);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollButtonVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = (filters: {
    city: string;
    region: string;
    wifi: boolean;
    equeue: boolean;
    service?: string;
    worksNow?: boolean;
    worksOnWeekend?: boolean;
    is24Hours?: boolean;
  }) => {
    let result = branches;

    if (filters.region) {
      result = result.filter(
        (b) => b.postalAddress.countrySubDivision === filters.region
      );
    }

    if (filters.city) {
      result = result.filter((b) => b.postalAddress.townName === filters.city);
    }

    const coordsForMap = result
      .map((b) => {
        const coords =
          b.postalAddress?.geographicCoordinates?.geolocation ||
          b.information?.[0]?.postalAddress?.geographicCoordinates?.geolocation;
        const lat = parseFloat((coords?.latitude || "").replace(",", "."));
        const lon = parseFloat((coords?.longitude || "").replace(",", "."));

        return !isNaN(lat) && !isNaN(lon) ? [lat, lon] : null;
      })
      .filter(Boolean) as [number, number][];

    if (filters.wifi) {
      result = result.filter((b) => b.WiFi);
    }
    if (filters.equeue) {
      result = result.filter((b) => b.equeue);
    }
    if (filters.service) {
      result = result.filter(b =>
        branchServices[b.id] &&
        Object.values(branchServices[b.id]).some(serviceArr =>
          serviceArr.includes(filters.service!)
        )
      );
    }
    if (filters.worksNow) {
      result = result.filter(isBranchOpenNow);
    }
    if (filters.worksOnWeekend) {
      result = result.filter(worksOnWeekend);
    }
    if (filters.is24Hours) {
      result = result.filter(is24Hours);
    }

    setFiltered(result);

    const now = new Date();
    console.log(
      `[${now.toLocaleString()}] Поиск отделений. Фильтры: ${JSON.stringify(filters)}. Найдено: ${result.length} отделений`
    );

    if (mapRef.current) {
      if (coordsForMap.length === 1) {
        mapRef.current.setCenter(coordsForMap[0], 14);
      } else if (coordsForMap.length > 1) {
        mapRef.current.setBounds(coordsForMap, {
          checkZoomRange: true,
          zoomMargin: 10,
        });
      } else if (filters.city && majorCities[filters.city]) {
        mapRef.current.setCenter(majorCities[filters.city], 11);
      } else if (filters.region) {
        const one = branches.find(
          (b) => b.postalAddress.countrySubDivision === filters.region
        );
        const coords =
          one?.postalAddress?.geographicCoordinates?.geolocation;
        const lat = parseFloat(coords?.latitude || "");
        const lon = parseFloat(coords?.longitude || "");
        if (!isNaN(lat) && !isNaN(lon)) {
          mapRef.current.setCenter([lat, lon], 10);
        }
      }
    }
  };

  function is24Hours(branch: any): boolean {
    if (!branch.information) return false;
    for (const info of branch.information) {
      if (Array.isArray(info.availability)) {
        for (const av of info.availability) {
          if (av.access24Hours === true) return true;
        }
      }
    }
    return false;
  }

  useEffect(() => {
    if (!selectedBranch) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedBranch(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedBranch]);

  if (loading) return <div className="loader"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>;

  return (
    <div className="container">
      <h2 className="title">Поиск областных управлений, ЦБУ и отделений</h2>
      <SearchForm
        onSearch={handleSearch}
        regions={Object.keys(citiesByRegion)}
        citiesByRegion={citiesByRegion}
        allCities={allCities}
        services={services}
      />
      <div className="results">
        <h3 className="subtitle">Найдено {filtered.length} структурных подразделений</h3>
        {filtered.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th className="table-header header-name">Название</th>
                <th className="table-header">Адрес и телефон</th>
                <th className="table-header header-time">Время работы</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((branch) => (
                <tr>
                  <td key={branch.id}
                  onClick={() => setSelectedBranch(branch)} className="results-td selected-branch">{branch.name}</td>
                  <td className="results-td">
                    {branch.postalAddress.countrySubDivision !== branch.postalAddress.townName
                      ? `${branch.postalAddress.countrySubDivision}, ${branch.postalAddress.townName},`
                      : `${branch.postalAddress.townName},`}
                    <br />
                    {formatStreetName(branch.postalAddress.streetName)} {branch.postalAddress.buildingNumber}
                    <br />
                    {getMobileNumber(branch)}
                  </td>
                  <td className="results-td">
                    {getWorkTime(branch)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <YMaps query={{ apikey: "fb2264f6-2f21-494e-ad0b-4899853b936c" }}>
          <div style={{ width: "70%", height: "500px", marginTop: 32 }}>
            <Map
              instanceRef={(map) => (mapRef.current = map)}
              defaultState={{
                center: [53.7098, 27.9534],
                zoom: 10,
              }}
              width="100%"
              height="100%"
            >
              {filtered.length === branches.length &&
                Object.entries(majorCities).map(([name, coords]) => (
                  <Placemark
                    key={name}
                    geometry={coords}
                    properties={{
                      balloonContent: `<b>${name}</b>`,
                    }}
                  />
                ))}

              {filtered.map((branch) => {
                const lat = parseFloat(
                  branch.postalAddress?.geographicCoordinates?.geolocation?.latitude || ""
                );
                const lon = parseFloat(
                  branch.postalAddress?.geographicCoordinates?.geolocation?.longitude || ""
                );

                if (isNaN(lat) || isNaN(lon)) return null;

                const routeUrl = `https://yandex.by/maps/?rtext=~${lat},${lon}&rtt=auto`;

                return (
                  <Placemark
                    key={branch.id}
                    geometry={[lat, lon]}
                    properties={{
                      balloonContent: `
                        <b>${branch.name}</b><br/>
                        ${branch.postalAddress.townName}<br/>
                        <a href="${routeUrl}" target="_blank" rel="noopener noreferrer">
                          Проложить маршрут
                        </a>
                      `,
                    }}
                    options={{
                      balloonPanelMaxMapArea: 0 
                    }}
                  />
                );
              })}
            </Map>
          </div>
        </YMaps>
      </div>
      {selectedBranch && (
        <div
          className="popup"
          onClick={() => setSelectedBranch(null)}
        >
          <div
            className="popup-window"
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "transparent",
                border: "none",
                fontSize: 22,
                cursor: "pointer"
              }}
              onClick={() => setSelectedBranch(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h3>{selectedBranch.name}</h3>
            <div style={{ marginBottom: 8 }}>
              <b>Адрес:</b><br />
              {selectedBranch.postalAddress.countrySubDivision !== selectedBranch.postalAddress.townName
                ? `${selectedBranch.postalAddress.countrySubDivision}, ${selectedBranch.postalAddress.townName},`
                : `${selectedBranch.postalAddress.townName},`}
              <br />
              {formatStreetName(selectedBranch.postalAddress.streetName)} {selectedBranch.postalAddress.buildingNumber}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Телефон:</b><br />
              {getMobileNumber(selectedBranch)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Время работы:</b><br />
              <span style={{ whiteSpace: "pre-line" }}>{getWorkTime(selectedBranch)}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>WiFi:</b> {selectedBranch.WiFi ? "Да" : "Нет"}<br />
              <b>Электронная очередь:</b> {selectedBranch.equeue ? "Да" : "Нет"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Время обеда:</b><br />
              {getLunchTime(selectedBranch)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Круглосуточно:</b>{" "}
              {is24Hours(selectedBranch) ? "Да" : "Нет"}
            </div>
            {branchServices[selectedBranch.id] && (
              <div style={{ marginBottom: 8 }}>
                <b>Услуги:</b>
                <ul>
                  {Object.values(branchServices[selectedBranch.id])
                    .flat()
                    .map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-btn ${isScrollButtonVisible ? 'visible' : ''}`}
        aria-label="Прокрутить вверх">
          ^
      </button>
    </div>
  );
}

export default SearchPage;