import { useEffect, useState } from "react";
import "./App.css";
import sprite from "./sprite.svg";



const App = () => {
  const [currentPage, setCurrentPage] = useState(window.sessionStorage.getItem('currentPage') !== null ? Number(window.sessionStorage.getItem('currentPage')) : -1);
	useEffect(() => {
		window.localStorage.setItem('сities', JSON.stringify([{id : 1, en : 'Moscow', ru : 'Москва'}, {id : 2, en : 'Saint Petersburg', ru : 'Санкт-Петербург'}, {id : 3, en : 'Izhevsk', ru : 'Ижевск'}, {id : 4, en : 'Kazan', ru : 'Казань'}]))
		if (window.localStorage.getItem('favouriteCities') === null){
			window.localStorage.setItem('favouriteCities', JSON.stringify([]))
		}
	}, [])


  const backToMain = () => {
	window.sessionStorage.setItem('currentPage', -1)  
	setCurrentPage(-1);
  }
  const forecast = (page) => {
	window.sessionStorage.setItem('currentPage', page)  
	setCurrentPage(page);
  }
  return (
    <div className="app">
      <Header backToMain = {backToMain}/>
      {currentPage === -1 ? <Main forecast = {forecast} /> : <CityForecast backToMain = {backToMain}  />}
    </div>
  );
};


const Header = ({backToMain}) => {
  return (
    <header className="header">
      <a href="#" className="header__logo" onClick={backToMain}>
        <svg className="logo__app-icon">
          <use href={sprite + "#app-icon"} />
        </svg>
        <span className="logo__name">WeatherCheck</span>
      </a>
    </header>
  );
};

const FavouriteCity = ({forecast, city}) => {
	const [forecastData, setForecastData] = useState({})
	const openWeatherRequest = `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=81fa18dbd91f1dfee9f40c6afa4e833e&q=${city.en}&lang=RU&units=metric`;
	useEffect(() => {
		fetch(openWeatherRequest)
		.then(res => res.json())
		.then(
			(data) => {
				setForecastData(data);
			},
			(error) => {
				console.error(error);
			})
	}, [])
	return (
		<a href="#" onClick={() => {forecast(city.id)}} className="favourite-cities__item">
			<p className="city__name">{Object.keys(forecastData).length !== 0 && forecastData?.city?.name}</p>
			<p className="city__temperature">{Object.keys(forecastData).length !== 0 && Math.round(forecastData?.list[0].main.feels_like) + '°'}</p>
			<svg  className="city__current-weather">
				<use href={Object.keys(forecastData).length !== 0 ? sprite + "#" + forecastData?.list[0].weather[0].main.toLowerCase() : ''} />
			</svg>
		</a>
	)
}

const FavouriteCities = ({forecast}) => {
	return(<div className="favourite-cities">{JSON.parse(window.localStorage.getItem('favouriteCities')).map((city) => <FavouriteCity key={city.id} forecast={forecast} city={city}/>)}</div>)
}


const Main = ({forecast}) => {
  return (
    <main className="main">
      <CityInput forecast={forecast} />
      {JSON.parse(window.localStorage.getItem('favouriteCities')).length === 0 ? <Tutorial /> : <FavouriteCities forecast = {forecast}/>}
    </main>
  );
};


const CityInput = ({forecast}) => {
  const [isSearching, setSearching] = useState(false);
  const inputCities = JSON.parse(window.localStorage.getItem('сities')).map(city => city.ru);
  const [searchResults, setSearchResults] = useState([]);
  const getInput = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    setSearching(searchValue.length >= 3);
    setSearchResults(
      inputCities.filter((city) => city.toLowerCase().includes(searchValue)).map((city, cityindex) => {
        const splitValue = city.substring(city.toLowerCase().indexOf(searchValue), city.toLowerCase().indexOf(searchValue) + searchValue.length)
          const searchResult = [city.split(splitValue)[0], splitValue, city.split(splitValue)[1],].filter((parts) => parts !== "");
		  const cityId = JSON.parse(window.localStorage.getItem('сities')).filter(currentCity => currentCity.ru === city)[0].id;
          return (
            <a href="#" onClick={() => {forecast(cityId)}} key={city} className="city-input__result">
              {searchResult.map((result, resultIndex) => {
                if (resultIndex === 0) {
                  result =
                    result.at(0).toUpperCase() + searchResult[0].substring(1);
                }
                return result.toLowerCase() === searchValue ? <span key = {result} className="result__match">{result}</span>: result ;
              })}
            </a>
          );
        })
    );
    
  };

  return (
    <div className="city-input">
      <input
        onInput={getInput}
        className="city-input__input"
        type="text"
        placeholder="Укажите город"
      ></input>
      {isSearching && searchResults !== [] && (
        <div className="city-input__results">{searchResults}</div>
      )}
    </div>
  );
};


const Tutorial = () => {
  return (
    <div className="tutorial">
      <div className="start-typing">
        <svg className="start-typing__arrow">
          <use href={sprite + "#arrow"} />
        </svg>
        <span className="start-typing__text">
          Начните вводить город, например,{" "}
          <span className="start-typing__example">Ижевск</span>
        </span>
      </div>
      <div className="using-bookmark">
        <p className="using-bookmark__text">
          Используйте значок «закладки», чтобы закрепить город на главной
        </p>
        <svg className="using-bookmark__bookmark">
          <use href={sprite + "#bookmark"} />
        </svg>
      </div>
    </div>
  );
};


const CityForecast = ({backToMain}) => {
  const [forecastData, setForecastData] = useState({});
  const city = JSON.parse(window.localStorage.getItem('сities')).filter(city => city.id === window.sessionStorage.getItem('currentPage'))[0];
  const [isFavourite, setFavourite] = useState(JSON.parse(window.localStorage.getItem('favouriteCities')).filter(currentCity => currentCity.id === city.id).length > 0);
  const openWeatherRequest = `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid=81fa18dbd91f1dfee9f40c6afa4e833e&q=${city.en}&lang=RU&units=metric`;
	
  useEffect(() => {
	fetch(openWeatherRequest)
	.then(res => res.json())
	.then(
	  (data) => {
		setForecastData(data);
	  },
	  (error) => {
		  console.error(error);
	  })
  }, [])

  const setFavourites = () => {
	  !isFavourite ? window.localStorage.setItem('favouriteCities', JSON.stringify([...JSON.parse(window.localStorage.getItem('favouriteCities')), city])) : window.localStorage.setItem('favouriteCities', JSON.stringify(JSON.parse(window.localStorage.getItem('favouriteCities')).filter(currentCity => currentCity.id !== city.id)));
	  setFavourite(prev => !prev);
  }
  

  const formForecast = () => {
	
  	return (
	<div className="city-forecast">
	<div className="upper-panel">
		<div onClick={backToMain} className="back">
			<svg className="back__img">
				<use href={sprite + "#back"} />
			</svg>
		<span className="back__text">Назад</span>
		</div>
		<svg onClick={setFavourites} className="bookmark">
			<use href={sprite + (isFavourite ? '#filled-bookmark' : '#bookmark')} />
		</svg>
	</div>
	<div className="city-forecast__wrapper">
		<span className="city-forecast__city-name">{Object.keys(forecastData).length !== 0 && forecastData?.city?.name}</span>
		<span className="city-forecast__weather-state">
			{Object.keys(forecastData).length !== 0 && forecastData?.list[0].weather[0]?.description[0].toUpperCase() + forecastData?.list[0].weather[0]?.description.substring(1)}
		</span>
		<div className="city-forecast__weather">
		<span className="city-forecast__temperature">{Object.keys(forecastData).length !== 0 && Math.round(forecastData?.list[0].main.feels_like) + '°'}</span>
			<svg  className="city-forecast__current-weather">
				<use href={Object.keys(forecastData).length !== 0 ? sprite + "#" + forecastData?.list[0].weather[0].main.toLowerCase() : ''} />
			</svg>
		</div>
		<div className="city-forecast__wind-state">
		<svg  className="city-forecast__wind-icon">
			<use href={sprite + "#barometer"} />
		</svg>
		<span className="city-forecast__wind-speed">{Object.keys(forecastData).length !== 0 && Math.round(forecastData?.list[0].wind?.speed * 100) + ' мм рт. ст.'}</span>
		</div>
		<span className="city-forecast__evening">{Object.keys(forecastData).length !== 0 && `Закат в ${new Date(forecastData?.city?.sunset).getHours()+12}:00`}</span>
	</div>
  </div>)}
  
  return formForecast();
};

export default App;
