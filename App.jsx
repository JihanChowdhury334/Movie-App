import React,{ useEffect, useState } from 'react'
import Spinner from './components/Spinner'
import Search from './components/Search'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'
import { database } from './appwrite.js';

const API_BASE_URL = "https://api.themoviedb.org/3"



const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
headers: {
  accept: 'application/json',
  Authorization: `Bearer ${API_KEY}`
}
}

const App = () => {
const [searchTerm, setSearchTerm] = useState('');

const [errorMessage, setErrorMessage] = useState('');
const [movieList,setMovieList]= useState([]);

const[trendingMovies, setTrendingMovies] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const[debouncedSearchTerm,setDebouncedSearchTerm] = useState()

useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm])




const fetchMovies = async(query = '') => {

  setIsLoading(true);
  setErrorMessage('');
  try {
    const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                           : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, API_OPTIONS);

    if (!response.ok){
      throw new Error("Failed to fetch movies");
    }

    const data = await response.json();

    if(data.Response == 'false') {
      setErrorMessage(data.Error || 'Failed to fetch movies' );
      setMovieList([]);
      return;
    }
    
    setMovieList(data.results || []);

    if(query && data.results.length > 0){
      await updateSearchCount(query, data.results[0]);
    }
  } catch (error){
    console.error(`Error fetching movies: ${error}`);
    setErrorMessage("Error fetching movies.  please try again later.");
  } finally {
    setIsLoading(false);
  }
}

const loadTrendingMovies = async() => {
  try {
    const movies = await getTrendingMovies();

    setTrendingMovies(movies);
  } catch (error) {
    console.error(`Error fetching trending movies: ${error}`);
    return [];
  }
}

useEffect(() => {
  const test = async () => {
    try {
      const res = await database.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID
      );
      console.log("Documents in collection:", res);
    } catch (err) {
      console.error("Error listing documents:", err.message);
    }
  };
  test();
}, []);



useEffect(()=>{
  fetchMovies(debouncedSearchTerm);
}, [debouncedSearchTerm])
  return (
    <main> 

      <div className="pattern"/>

      <div className="wrapper">
       <header>
        <img src="./hero.png" alt="Hero Banner"/>
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy without the Hassle</h1>

       <Search searchTerm ={searchTerm} setSearchTerm={setSearchTerm}/>

      </header>

      {trendingMovies.length > 0 && (
        <section className="trending">
          <h2>Trending Movies</h2>

          <ul>
            {trendingMovies.map((movie,index) => (
              <li key={movie.$id}>
                  <p>{index+1}</p>
              </li>
            ))}
          </ul>
        </section>
      )}



      <section className="all-movies">
        <h2>All Movies</h2>

        {isLoading ? (
          <Spinner/>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>

        ) : (
          <ul>
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie = {movie} />
            ))}
          </ul>
        )}
      </section>

       
       <h1 className="text-white">{searchTerm}</h1>
      </div>

    </main>
  )


useEffect(()=> {
  loadTrendingMovies();
}, []);
}
export default App
