import React, { useMemo, useRef } from 'react';
import SongCardSkeleton from './skeletons/SongCardSkeleton';
import GenreCardSkeleton from './skeletons/GenreCardSkeleton';
import premiumLotusIcon from '/premium-lotus-icon.png';

// --- Icons ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect width="6" height="16" x="4" y="4"/><rect width="6" height="16" x="14" y="4"/></svg>;
const HeartIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ebba2f" : "none"} stroke={filled ? "#ebba2f" : "currentColor"} strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
const ScrollRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const ScrollLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;

// --- Reusable Carousel Component ---
const Carousel = ({ title, children, isLoading, skeletonType }) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const Skeleton = skeletonType === 'song' ? SongCardSkeleton : GenreCardSkeleton;
  const skeletonCount = 4;

  return (
    <div className="search-carousel-container">
      <h3 className="search-carousel-title">{title}</h3>
      <div className="carousel-wrapper">
        <button className="carousel-scroll-button left" onClick={() => handleScroll('left')}>
          <ScrollLeftIcon />
        </button>
        <div className="carousel-scroll-area" ref={scrollRef}>
          {isLoading ? (
            Array.from({ length: skeletonCount }).map((_, index) => <Skeleton key={index} />)
          ) : children.length > 0 ? (
            children
          ) : (
            <p className="no-results-text">No items found in this category.</p>
          )}
        </div>
        <button className="carousel-scroll-button right" onClick={() => handleScroll('right')}>
          <ScrollRightIcon />
        </button>
      </div>
    </div>
  );
};

const SearchPage = ({
  searchQuery, songs, genres, subGenres, onBack,
  handlePlayPause, currentPlayingSong, isPlaying, formatTime,
  favouriteSongs, handleToggleFavourite, handleDownload, loadingSongs,
  handleExploreGenre, handleExploreSubgenre
}) => {
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return { music: [], genres: [], subGenres: [] };

    const matchedSong = songs.find(s => s.title.toLowerCase() === query);
    const matchedGenre = genres.find(g => g.name.toLowerCase() === query);
    const matchedSubGenre = subGenres.find(sg => sg.name.toLowerCase() === query);

    let music = [], relatedGenres = [], relatedSubGenres = [];

    if (matchedSong) {
      const songGenres = matchedSong.genres.map(g => g._id);
      const songSubGenres = matchedSong.subGenres.map(sg => sg._id);
      const relatedSongs = songs.filter(s => s._id !== matchedSong._id && (s.genres.some(g => songGenres.includes(g._id)) || s.subGenres.some(sg => songSubGenres.includes(sg._id))));
      music = [matchedSong, ...relatedSongs];
      relatedGenres = matchedSong.genres;
      const parentGenreIds = new Set(matchedSong.genres.map(g => g._id));
      const siblingSubGenres = subGenres.filter(sg => parentGenreIds.has(sg.genre?._id) && !songSubGenres.includes(sg._id));
      relatedSubGenres = [...matchedSong.subGenres, ...siblingSubGenres];
    } else if (matchedGenre) {
      const genreId = matchedGenre._id;
      const subGenresInGenre = subGenres.filter(sg => sg.genre?._id === genreId);
      const songsBySubGenre = subGenresInGenre.map(sg => songs.filter(s => s.subGenres.some(s_sg => s_sg._id === sg._id)));
      let interleaved = [];
      let i = 0;
      let songsLeft = true;
      while(songsLeft) {
        songsLeft = false;
        songsBySubGenre.forEach(list => {
          if (list[i]) {
            interleaved.push(list[i]);
            songsLeft = true;
          }
        });
        i++;
      }
      music = interleaved;
      relatedGenres = [matchedGenre];
      relatedSubGenres = subGenresInGenre;
    } else if (matchedSubGenre) {
      const subGenreName = matchedSubGenre.name;
      const allMatchingSubGenres = subGenres.filter(sg => sg.name.toLowerCase() === subGenreName.toLowerCase());
      const matchingSubGenreIds = allMatchingSubGenres.map(sg => sg._id);
      const songsByGenre = {};
      songs.forEach(song => {
        if (song.subGenres.some(sg => matchingSubGenreIds.includes(sg._id))) {
          const parentGenre = song.genres[0];
          if (parentGenre) {
            if (!songsByGenre[parentGenre.name]) songsByGenre[parentGenre.name] = [];
            songsByGenre[parentGenre.name].push(song);
          }
        }
      });
      let interleaved = [];
      let i = 0;
      let songsLeft = true;
      const songLists = Object.values(songsByGenre);
      while(songsLeft) {
        songsLeft = false;
        songLists.forEach(list => {
          if (list[i]) {
            interleaved.push(list[i]);
            songsLeft = true;
          }
        });
        i++;
      }
      music = interleaved;
      relatedGenres = genres.filter(g => allMatchingSubGenres.some(sg => sg.genre?._id === g._id));
      relatedSubGenres = allMatchingSubGenres;
    } else {
      music = songs.filter(song => song.title.toLowerCase().includes(query) || (song.genres && song.genres.some(g => g.name.toLowerCase().includes(query))) || (song.subGenres && song.subGenres.some(sg => sg.name.toLowerCase().includes(query))));
      relatedGenres = genres.filter(g => g.name.toLowerCase().includes(query));
      relatedSubGenres = subGenres.filter(sg => sg.name.toLowerCase().includes(query));
    }

    return { music, genres: relatedGenres, subGenres: relatedSubGenres };
  }, [searchQuery, songs, genres, subGenres]);

  return (
    <section className="search-results-section" id="search-results-section">
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeftIcon /> Back to Main
        </button>
      </div>
      <h2 className="search-results-title">Search Results for: "{searchQuery}"</h2>

      <Carousel title="music/song related to your search" isLoading={loadingSongs} skeletonType="song">
        {searchResults.music.map(song => (
          <div key={song._id} className="search-song-card">
            <img src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'} alt={song.title} className="search-song-card-image" />
            {(song.collectionType === 'premium' || song.collectionType === 'paid') && (
              <div className="search-premium-indicator">
                <img src={premiumLotusIcon} alt="Premium" className="search-premium-indicator-icon"/>
              </div>
            )}
            <div className="search-song-text-and-button-wrapper">
              <div className="search-song-card-info">
                <h4>{song.title}</h4>
                <div className="search-genre-scroll-wrapper">
                  <div className="search-genre-pill-container">
                    {song.genres?.map(g => (
                      <span key={g._id} className="search-genre-pill" onClick={() => handleExploreGenre(g._id, 'search')}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                  <div className="search-subgenre-pill-container">
                    {song.subGenres?.map(sg => (
                      <span key={sg._id} className="search-subgenre-pill" onClick={() => handleExploreSubgenre(sg._id, 'search')}>
                        {sg.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="search-song-card-bottom-row">
                <span className="search-song-timestamp">{formatTime(song.duration)}</span>
                <button className="search-icon-button" onClick={() => handleToggleFavourite(song._id)}>
                  <HeartIcon filled={favouriteSongs.has(song._id)} />
                </button>
                <button className="search-icon-button" onClick={() => handleDownload(song.audioUrl, song.title)}>
                  <DownloadIcon />
                </button>
                <button className="search-play-button" onClick={() => handlePlayPause(song)}>
                  {currentPlayingSong?._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <Carousel title="Genres related to your search" isLoading={loadingSongs} skeletonType="genre">
        {searchResults.genres.map(genre => (
          <div key={genre._id} className="genre-card">
            <img src={genre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'} alt={genre.name} className="genre-card-image" />
            <h5 className="genre-card-name">{genre.name}</h5>
            <div className="genre-card-description-wrapper">
              <p className="genre-card-description">{genre.description}</p>
            </div>
            <button className="explore-button" onClick={() => handleExploreGenre(genre._id, 'search')}>EXPLORE</button>
          </div>
        ))}
      </Carousel>

      <Carousel title="Sub-Genre related to your search" isLoading={loadingSongs} skeletonType="genre">
        {searchResults.subGenres.map(subGenre => (
          <div key={subGenre._id} className="genre-card">
            <img src={subGenre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=VARA'} alt={subGenre.name} className="genre-card-image" />
            <h5 className="genre-card-name">{subGenre.name}</h5>
            {subGenre.genre && <span className="subgenre-genre-pill">{subGenre.genre.name}</span>}
            <div className="genre-card-description-wrapper">
              <p className="genre-card-description">{subGenre.description}</p>
            </div>
            <button className="explore-button" onClick={() => handleExploreSubgenre(subGenre._id, 'search')}>EXPLORE</button>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default SearchPage;