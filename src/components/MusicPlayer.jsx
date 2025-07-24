import React from 'react';
import MusicPlayerSkeleton from '../skeletons/MusicPlayerSkeleton';

// --- Icon Definitions ---
// It's good practice to keep these icons here or move them to a dedicated Icons.jsx file
// as you had before, to keep components clean.

// Player Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect width="6" height="16" x="4" y="4"/><rect width="6" height="16" x="14" y="4"/></svg>;
const SkipForwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const SkipBackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;

// NEW/UPDATED: Volume Icons for different states
const VolumeMuteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const Volume1Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const Volume2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;

// NEW: Close Icon
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;


const MusicPlayer = ({
    loadingSongs,
    currentPlayingSong,
    isPlaying,
    progress,
    duration,
    currentTime,
    volume,
    handlePreviousSong,
    handlePlayPause,
    handleNextSong,
    handleSeek,
    handleVolumeChange,
    formatTime,
    // NEW Props
    toggleMute,
    handleClosePlayer
}) => {
    if (loadingSongs && !currentPlayingSong) {
        return <MusicPlayerSkeleton />;
    }

    if (!currentPlayingSong) {
        return null; // Don't render if no song is selected
    }

    // NEW: Helper function to determine which volume icon to show
    const renderVolumeIcon = () => {
        if (volume === 0) {
            return <VolumeMuteIcon />;
        }
        if (volume > 0 && volume <= 0.5) {
            return <Volume1Icon />;
        }
        return <Volume2Icon />;
    };

    return (
        <div className="music-player-bar">
            {/* Song Info */}
            <div className="player-song-info">
                <img src={currentPlayingSong.imageUrl || 'https://placehold.co/60x60/333/FFF?text=VARA'} alt={currentPlayingSong.title} className="player-song-image" />
                <div className="player-song-details">
                    <span className="player-song-title">{currentPlayingSong.title}</span>
                    <span className="player-song-artist">
                        {currentPlayingSong.genres?.map(g => g.name).join(', ') || 'VARA Music'}
                    </span>
                </div>
            </div>

            {/* Main Controls */}
            <div className="player-controls">
                <button className="player-control-button" onClick={handlePreviousSong} aria-label="Previous Song">
                    <SkipBackIcon />
                </button>
                <button className="player-control-button play-pause-button" onClick={() => handlePlayPause()} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className="player-control-button" onClick={handleNextSong} aria-label="Next Song">
                    <SkipForwardIcon />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="player-progress">
                <span className="time-display">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    className="progress-bar"
                    onChange={handleSeek}
                    style={{ backgroundSize: `${progress}% 100%` }}
                    aria-label="Song progress"
                />
                <span className="time-display">{formatTime(duration)}</span>
            </div>

            {/* Volume Controls */}
            <div className="player-volume">
                <button className="player-control-button" onClick={toggleMute} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
                    {renderVolumeIcon()}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    className="volume-bar"
                    onChange={handleVolumeChange}
                    style={{ backgroundSize: `${volume * 100}% 100%` }}
                    aria-label="Volume control"
                />
            </div>

            {/* NEW: Extra Controls (Close Button) */}
            <div className="player-extra-controls">
                 <button className="player-control-button close-player-button" onClick={handleClosePlayer} aria-label="Close player">
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
};

export default MusicPlayer;
