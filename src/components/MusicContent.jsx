import React from 'react';
import ContentTabsSkeleton from '../skeletons/ContentTabsSkeleton';
import SongCardSkeleton from '../skeletons/SongCardSkeleton';
import GenreCardSkeleton from '../skeletons/GenreCardSkeleton';
import { ArrowLeftIcon, PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from './Icons';
import premiumLotusIcon from '/premium-lotus-icon.png';

const MusicContent = ({
    loadingContentTabs,
    activeTab,
    setActiveTab,
    setSelectedGenreForSubgenres,
    setSelectedSubgenreForSongs,
    setDisplayedSubgenreTitle,
    setDisplayedGenreTitle,
    selectedGenreForSubgenres,
    selectedSubgenreForSongs,
    loadingSongs,
    handleBackButtonClick,
    displayedGenreTitle,
    displayedSubgenreTitle,
    error,
    songsForSelectedSubgenre,
    handleExploreGenre,
    handleExploreSubgenre,
    handlePlayPause,
    currentPlayingSong,
    isPlaying,
    formatTime,
    favouriteSongs,
    handleToggleFavourite,
    handleDownload,
    subgenresForSelectedGenre,
    genres,
    subGenres,
    mainContentFilteredSongs
}) => {
    return (
        <section className="music-content" id="music-content-section">
            {loadingContentTabs ? <ContentTabsSkeleton /> : (
                <div className="content-tabs" id="content-tabs-section">
                    <button className={`tab-button ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedGenreForSubgenres(null); setSelectedSubgenreForSongs(null); setDisplayedSubgenreTitle(null); setDisplayedGenreTitle(null); }}>FOR YOU</button>
                    <button className={`tab-button ${activeTab === 'genres' ? 'active' : ''}`} onClick={() => { setActiveTab('genres'); setSelectedGenreForSubgenres(null); setSelectedSubgenreForSongs(null); setDisplayedSubgenreTitle(null); setDisplayedGenreTitle(null); }}>GENRES</button>
                    <button className={`tab-button ${activeTab === 'subgenres' ? 'active' : ''}`} onClick={() => { setActiveTab('subgenres'); setSelectedGenreForSubgenres(null); setSelectedSubgenreForSongs(null); setDisplayedSubgenreTitle(null); setDisplayedGenreTitle(null); }}>SUB GENRES</button>
                    <button className={`tab-button ${activeTab === 'freesongs' ? 'active' : ''}`} onClick={() => { setActiveTab('freesongs'); setSelectedGenreForSubgenres(null); setSelectedSubgenreForSongs(null); setDisplayedSubgenreTitle(null); setDisplayedGenreTitle(null); }}>FREE SONGS</button>
                    <button className={`tab-button ${activeTab === 'favourites' ? 'active' : ''}`} onClick={() => { setActiveTab('favourites'); setSelectedGenreForSubgenres(null); setSelectedSubgenreForSongs(null); setDisplayedSubgenreTitle(null); setDisplayedGenreTitle(null); }}>FAVOURITES</button>
                </div>
            )}

            {(selectedGenreForSubgenres || selectedSubgenreForSongs) && !loadingSongs && (
                <div className="back-button-container">
                    <button className="back-button" onClick={handleBackButtonClick}>
                        <ArrowLeftIcon /> Back
                    </button>
                </div>
            )}

            {displayedGenreTitle && !selectedSubgenreForSongs && !loadingSongs && (
                <h2 className="subgenre-display-title">{displayedGenreTitle}</h2>
            )}

            {displayedSubgenreTitle && !loadingSongs && (
                <h2 className="subgenre-display-title">{displayedSubgenreTitle}</h2>
            )}

            <div className={`content-grid ${
                (activeTab === 'genres' || activeTab === 'subgenres') && !selectedSubgenreForSongs
                ? 'genres-grid'
                : ''
            }`}>
                {loadingSongs ? (
                    (activeTab === 'genres' || activeTab === 'subgenres') ? (
                        Array.from({ length: 8 }).map((_, index) => <GenreCardSkeleton key={index} />)
                    ) : (
                        Array.from({ length: 9 }).map((_, index) => <SongCardSkeleton key={index} />)
                    )
                ) : error ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ff6b6b', fontSize: '1.2em' }}>{error}</p>
                ) : (() => {
                    if (selectedSubgenreForSongs) {
                        return songsForSelectedSubgenre.length > 0 ? (
                            songsForSelectedSubgenre.map(song => (
                                <div key={song._id} className="song-card">
                                    <img src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'} alt={song.title} className="song-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }} />
                                    {(song.collectionType === 'premium' || song.collectionType === 'paid') && (<div className="premium-indicator"><img src={premiumLotusIcon} alt="Premium" className="premium-indicator-icon" /></div>)}
                                    <div className="song-text-and-button-wrapper">
                                        <div className="song-card-info">
                                            <h4>{song.title}</h4>
                                            <div className="genre-scroll-wrapper">
                                                {song.genres && song.genres.length > 0 && (<div className="genre-pill-container">{song.genres.map(g => (<span key={g._id} className="genre-pill" onClick={() => handleExploreGenre(g._id)}>{g.name}</span>))}</div>)}
                                                {song.subGenres && song.subGenres.length > 0 && (<div className="subgenre-pill-container">{song.subGenres.map(sg => (<span key={sg._id} className="subgenre-pill" onClick={() => handleExploreSubgenre(sg._id)}>{sg.name}</span>))}</div>)}
                                            </div>
                                        </div>
                                        <div className="song-card-bottom-row">
                                            <span className="song-timestamp">{formatTime(song.duration)}</span>
                                            <button className="icon-button" onClick={() => handleToggleFavourite(song._id)} aria-label={favouriteSongs.has(song._id) ? "Remove from favourites" : "Add to favourites"}><HeartIcon filled={favouriteSongs.has(song._id)} /></button>
                                            <button className="icon-button" onClick={() => handleDownload(song.audioUrl, song.title)} aria-label="Download song"><DownloadIcon /></button>
                                            <button className="play-button" onClick={() => handlePlayPause(song)}>{currentPlayingSong && currentPlayingSong._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : ( <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No songs found for this sub-genre.</p> )
                    }
                    if (selectedGenreForSubgenres) {
                        return subgenresForSelectedGenre.length > 0 ? (
                            subgenresForSelectedGenre.map(subGenre => (
                                <div key={subGenre._id} className="genre-card">
                                    <img src={subGenre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=SubGenre+Image'} alt={subGenre.name} className="genre-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=SubGenre+Image'; }} />
                                    <h5 className="genre-card-name">{subGenre.name}</h5>
                                    {subGenre.genre && (<span className="subgenre-genre-pill">{subGenre.genre.name}</span>)}
                                    <div className="genre-card-description-wrapper"><p className="genre-card-description">{subGenre.description}</p></div>
                                    <button className="explore-button" onClick={() => handleExploreSubgenre(subGenre._id)}>EXPLORE</button>
                                </div>
                            ))
                        ) : ( <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No sub-genres found for this genre.</p> )
                    }
                    if (activeTab === 'genres') {
                        return genres.length > 0 ? (
                            genres.map(genre => (
                                <div key={genre._id} className="genre-card">
                                    <img src={genre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=Genre+Image'} alt={genre.name} className="genre-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=Genre+Image'; }} />
                                    <h5 className="genre-card-name">{genre.name}</h5>
                                    <div className="genre-card-description-wrapper"><p className="genre-card-description">{genre.description}</p></div>
                                    <button className="explore-button" onClick={() => handleExploreGenre(genre._id)}>EXPLORE</button>
                                </div>
                            ))
                        ) : ( <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No genres found.</p> )
                    }
                    if (activeTab === 'subgenres') {
                        return subGenres.length > 0 ? (
                            subGenres.map(subGenre => (
                                <div key={subGenre._id} className="genre-card">
                                    <img src={subGenre.imageUrl || 'https://placehold.co/200x200/333/FFF?text=SubGenre+Image'} alt={subGenre.name} className="genre-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=SubGenre+Image'; }} />
                                    <h5 className="genre-card-name">{subGenre.name}</h5>
                                    {subGenre.genre && (<span className="subgenre-genre-pill">{subGenre.genre.name}</span>)}
                                    <div className="genre-card-description-wrapper"><p className="genre-card-description">{subGenre.description}</p></div>
                                    <button className="explore-button" onClick={() => handleExploreSubgenre(subGenre._id)}>EXPLORE</button>
                                </div>
                            ))
                        ) : ( <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No sub-genres found.</p> )
                    }
                    // Default case for home, freesongs, favourites
                    return mainContentFilteredSongs.length > 0 ? (
                        mainContentFilteredSongs.map(song => (
                            <div key={song._id} className="song-card">
                                <img src={song.imageUrl || 'https://placehold.co/200x200/333/FFF?text=No+Image'} alt={song.title} className="song-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/333/FFF?text=No+Image'; }} />
                                {(song.collectionType === 'premium' || song.collectionType === 'paid') && (<div className="premium-indicator"><img src={premiumLotusIcon} alt="Premium" className="premium-indicator-icon" /></div>)}
                                <div className="song-text-and-button-wrapper">
                                    <div className="song-card-info">
                                        <h4>{song.title}</h4>
                                        <div className="genre-scroll-wrapper">
                                            {song.genres && song.genres.length > 0 && (<div className="genre-pill-container">{song.genres.map(g => (<span key={g._id} className="genre-pill" onClick={() => handleExploreGenre(g._id)}>{g.name}</span>))}</div>)}
                                            {song.subGenres && song.subGenres.length > 0 && (<div className="subgenre-pill-container">{song.subGenres.map(sg => (<span key={sg._id} className="subgenre-pill" onClick={() => handleExploreSubgenre(sg._id)}>{sg.name}</span>))}</div>)}
                                        </div>
                                    </div>
                                    <div className="song-card-bottom-row">
                                        <span className="song-timestamp">{formatTime(song.duration)}</span>
                                        <button className="icon-button" onClick={() => handleToggleFavourite(song._id)} aria-label={favouriteSongs.has(song._id) ? "Remove from favourites" : "Add to favourites"}><HeartIcon filled={favouriteSongs.has(song._id)} /></button>
                                        <button className="icon-button" onClick={() => handleDownload(song.audioUrl, song.title)} aria-label="Download song"><DownloadIcon /></button>
                                        <button className="play-button" onClick={() => handlePlayPause(song)}>{currentPlayingSong && currentPlayingSong._id === song._id && isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : ( <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>No songs found matching your criteria.</p> )
                })()}
            </div>
        </section>
    );
};

export default MusicContent;
