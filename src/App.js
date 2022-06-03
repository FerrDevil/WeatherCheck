import { useEffect, useState } from "react";
import "./App.css";
import sprite from "./sprite.svg";
import {Link, Routes, Route ,useNavigate, useLocation, useParams} from 'react-router-dom';


const App = () => {
  localStorage.setItem('сities', JSON.stringify([{id : 1, en : 'Moscow', ru : 'Москва'},
    {id : 2, en : 'Saint Petersburg', ru : 'Санкт-Петербург'},
    {id : 3, en : 'Izhevsk', ru : 'Ижевск'},
    {id : 4, en : 'Kazan', ru : 'Казань'}]));
  if (localStorage.getItem('favouriteCities') === null){
    localStorage.setItem('favouriteCities', JSON.stringify([]))
  }
  return (
      <div className="app">
        <Header/>
        <Routes>
          <Route exact path="/" element={<Main/>}/>
          <Route path="/city/:cityId" element={<CityForecast/>}/>
        </Routes>
      </div>
  );
};


const Header = () => {
  return (
    <header className="header">
      <Link to="/" href="#" className="header__logo" >
        <svg className="logo__app-icon">
          <use href={sprite + "#app-icon"} />
        </svg>
        <span className="logo__name">WeatherCheck</span>
      </Link>
    </header>
  );
};

const FavouriteCity = ({city}) => {
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
		<Link to={`/city/${city.id}/`} className="favourite-cities__item">
			<p className="city__name">{Object.keys(forecastData).length !== 0 && forecastData?.city?.name}</p>
			<p className="city__temperature">{Object.keys(forecastData).length !== 0 && Math.round(forecastData?.list[0].main.feels_like) + '°'}</p>
			<svg className="city__current-weather">
				<use href={Object.keys(forecastData).length !== 0 ? sprite + "#" + forecastData?.list[0].weather[0].main.toLowerCase() : ''} />
			</svg>
		</Link>
	)
}

const FavouriteCities = () => {
	return(<div className="favourite-cities">{JSON.parse(localStorage.getItem('favouriteCities')).map((city) => <FavouriteCity key={city.id} city={city}/>)}</div>)
}


const Main = ({forecast}) => {
  return (
    <main className="main">
      <CityInput forecast={forecast} />
      {JSON.parse(localStorage.getItem('favouriteCities'))?.length === 0 ? <Tutorial /> : <FavouriteCities forecast = {forecast}/>}
    </main>
  );
};


const CityInput = ({forecast}) => {
  const [isSearching, setSearching] = useState(false);
  const inputCities = JSON.parse(localStorage.getItem('сities')).map(city => city.ru);
  const [searchResults, setSearchResults] = useState([]);
  const getInput = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    setSearching(searchValue.length >= 3);
    setSearchResults(
      inputCities.filter((city) => city.toLowerCase().includes(searchValue)).map((city, cityindex) => {
        const splitValue = city.substring(city.toLowerCase().indexOf(searchValue), city.toLowerCase().indexOf(searchValue) + searchValue.length)
          const searchResult = [city.split(splitValue)[0], splitValue, city.split(splitValue)[1],].filter((parts) => parts !== "");
		  const cityId = JSON.parse(localStorage.getItem('сities')).filter(currentCity => currentCity.ru === city)[0].id;
          return (
            <Link to={`/city/${cityId}/`} key={city} className="city-input__result">
              {searchResult.map((result, resultIndex) => {
                if (resultIndex === 0) {
                  result =
                    result.at(0).toUpperCase() + searchResult[0].substring(1);
                }
                return result.toLowerCase() === searchValue ? <span key = {result} className="result__match">{result}</span>: result ;
              })}
            </Link>
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


const CityForecast = () => {
  const cityId = parseInt(useParams().cityId);
  const [forecastData, setForecastData] = useState({});
  const city = JSON.parse(localStorage.getItem('сities')).filter(city => city.id === Number(cityId))[0];
  const [isFavourite, setFavourite] = useState(JSON.parse(localStorage.getItem('favouriteCities')).filter(currentCity => currentCity.id === cityId).length > 0);
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
  }, [openWeatherRequest])

  useEffect(() => {
    
    setFavourite(JSON.parse(localStorage.getItem('favouriteCities')).filter(favCity => favCity.id === cityId).length > 0) 
  }, [cityId])

  const setFavourites = () => {
	  !isFavourite ? localStorage.setItem('favouriteCities',
      JSON.stringify([...JSON.parse(localStorage.getItem('favouriteCities')), city]))
      : localStorage.setItem('favouriteCities', JSON.stringify(JSON.parse(localStorage.getItem('favouriteCities')).filter(currentCity => currentCity.id !== city.id)));
	  setFavourite(prev => !prev);
  }

  const formForecast = () => {
  	return (
	<div className="city-forecast">
	<div className="upper-panel">
		<Link to='/'  className="back">
			<svg className="back__img">
				<use href={sprite + "#back"} />
			</svg>
		<span className="back__text">Назад</span>
		</Link>
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
