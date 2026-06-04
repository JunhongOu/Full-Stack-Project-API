import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [cats, setCats] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [breeds, setBreeds] = useState([])
  const API_URL = 'https://api.thecatapi.com/v1/images/search?limit=10'
  const BREEDS_URL = 'https://api.thecatapi.com/v1/breeds'
  const FAVORITES_KEY = 'catFavorites'

  // Load favorites and breeds on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      }
      catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
    fetchBreeds()
    fetchCats()
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      console.log('Favorites saved:', favorites)
    }
    catch (error) {
      console.error('Error saving favorites:', error)
    }
  }, [favorites])

  // Fetch to get cat breeds
  const fetchBreeds = async () => {
    try {
      const response = await fetch(BREEDS_URL)
      if (response.ok) {
        const breedsData = await response.json()
        setBreeds(breedsData)
        console.log('Loaded breeds:', breedsData.length)
      }
    } 
    catch (error) {
      console.error('Error fetching breeds:', error)
    }
  }

  //Fetch to get cat images
  const fetchCats = async (breedId = '') => {
    setLoading(true)
    try {
      let url = API_URL
      if (breedId) {
        url += `&breed_ids=${breedId}`
      }

      console.log('Fetching data from:', url)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      setCats(data)
      console.log(`Successfully displayed ${data.length} cat images`)

    }
    catch (error) {
      console.error('Error fetching cat images:', error)
      alert('Failed to load cat images. Check the console for details.')
    }
    finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchCats() // Fetch random cats if no search query
      return
    }

    // Find breed by name
    const breed = breeds.find(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (breed) {
      console.log('Searching for breed:', breed.name)
      fetchCats(breed.id)
    } 
    else {
      alert('Breed not found. Please try a different search term.')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isFavorited = (catId) => {
    return favorites.some(cat => cat.id === catId)
  }

  const addToFavorites = (cat) => {
    if (!isFavorited(cat.id)) {
      setFavorites(prev => [...prev, cat])
      console.log('Added to favorites:', cat.id)
    }
  }

  const removeFromFavorites = (catId) => {
    setFavorites(prev => prev.filter(cat => cat.id !== catId))
    console.log('Removed from favorites:', catId)
  }

  const toggleFavorite = (cat) => {
    if (isFavorited(cat.id)) {
      removeFromFavorites(cat.id)
    } 
    else {
      addToFavorites(cat)
    }
  }

  const CatCard = ({ cat, showFavoriteButton = true }) => (
    <div className="cat-card">
      <img
        src={cat.url}
        alt={`Cat ${cat.id}`}
        onError={(e) => {
          console.error('Failed to load image:', cat.url)
          const img = e.currentTarget
          img.style.display = 'none'
          const placeholder = img.nextElementSibling
          if (placeholder instanceof HTMLElement) {
            placeholder.style.display = 'flex'
          }
        }}
      />
      <div className="placeholder" style={{ display: 'none' }}>
        Image failed to load
      </div>
      {showFavoriteButton && (
        <button
          className={`favorite-btn ${isFavorited(cat.id) ? 'favorited' : ''}`}
          onClick={() => toggleFavorite(cat)}
          title={isFavorited(cat.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          ❤️
        </button>
      )}
    </div>
  )

  return (
    <div className="app">
      <h1>Random Cat Images</h1>
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by breeds (e.g., Persian, Siamese)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} disabled={loading} className="search-btn">
            Search
          </button>
        </div>
        <button onClick={() => fetchCats()} disabled={loading} className="random-btn">
          {loading ? 'Loading...' : 'Get Random Cats'}
        </button>
      </div>
      <div className="data-container">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>

      <h2>My Favorite Cats</h2>
      <div className="favorites-container">
        {favorites.length === 0 ? (
          <div className="cat-card">
            <div className="placeholder">You don't have a favorite cat at the moment.</div>
          </div>
        ) : (
          favorites.map((cat) => (
            <CatCard key={`fav-${cat.id}`} cat={cat} showFavoriteButton={true} />
          ))
        )}
      </div>
    </div>
  )
}

export default App
