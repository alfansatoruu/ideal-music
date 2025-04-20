import React, { useState, useEffect, useRef } from "react";
import musicData from "./music-data.json";
import "./App.css";
import "./animasi-svg.css";

const MusicPlayer = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const audioRef = useRef(null);
  const cardStackRef = useRef(null);
  const cardsRefs = useRef([]);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Play error:", error);
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Update progress bar
  const updateProgress = () => {
    const currentTimeVal = audioRef.current.currentTime;
    const durationVal = audioRef.current.duration || 0;

    if (durationVal) {
      setProgress((currentTimeVal / durationVal) * 100);
      setCurrentTime(formatTime(currentTimeVal));
      setDuration(formatTime(durationVal));
    }
  };

  // Handle card swipe animation and change song
  const swipeCard = (direction) => {
    const currentCard = cardsRefs.current[currentSongIndex];

    if (currentCard) {
      currentCard.classList.add(
        direction === "left" ? "swiping-left" : "swiping-right"
      );

      setTimeout(() => {
        currentCard.classList.remove("swiping-left", "swiping-right");

        if (direction === "left") {
          handleNext();
        } else {
          handlePrev();
        }

        rearrangeCards();
      }, 500);
    }
  };

  // Rearrange cards in the stack after swipe
  const rearrangeCards = () => {
    cardsRefs.current.forEach((card, index) => {
      card.classList.remove("swiping-left", "swiping-right");
      card.classList.add("move-up");

      const distanceFromCurrent =
        (index - currentSongIndex + musicData.length) % musicData.length;

      if (distanceFromCurrent === 0) {
        card.style.transform = "translateY(0) scale(1)";
        card.style.zIndex = "5";
        card.style.opacity = "1";
      } else if (distanceFromCurrent === 1) {
        card.style.transform = "translateY(15px) scale(0.95)";
        card.style.zIndex = "4";
        card.style.opacity = "0.9";
      } else if (distanceFromCurrent === 2) {
        card.style.transform = "translateY(30px) scale(0.9)";
        card.style.zIndex = "3";
        card.style.opacity = "0.8";
      } else {
        card.style.transform = "translateY(45px) scale(0.85)";
        card.style.zIndex = "2";
        card.style.opacity = "0.7";
      }

      setTimeout(() => {
        card.classList.remove("move-up");
      }, 400);
    });
  };

  // Handle touch events for swiping
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const SWIPE_THRESHOLD = 50;
    const diffX = touchEndXRef.current - touchStartXRef.current;

    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
      if (diffX > 0) {
        swipeCard("right");
      } else {
        swipeCard("left");
      }
    }
  };

  // Handle song change
  const changeSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);

    if (audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.src = musicData[index].file;

      const handleCanPlay = () => {
        audio.play().catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Play error:", error);
          }
        });
        audio.removeEventListener("canplay", handleCanPlay);
      };

      audio.addEventListener("canplay", handleCanPlay);
    }

    rearrangeCards();
  };

  // Handle next/previous song
  const handleNext = () => {
    const nextIndex = (currentSongIndex + 1) % musicData.length;
    changeSong(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentSongIndex - 1 + musicData.length) % musicData.length;
    changeSong(prevIndex);
  };

  useEffect(() => {
    if (cardsRefs.current.length > 0) {
      rearrangeCards();
    }
  }, [currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    const errorHandler = (e) => {
      if (
        e.target.error &&
        e.target.error.code === MediaError.MEDIA_ERR_ABORTED
      )
        return;
      console.error("Audio error:", e.target.error);
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", handleNext);
      audio.addEventListener("error", errorHandler);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", handleNext);
        audio.removeEventListener("error", errorHandler);
      }
    };
  }, [currentSongIndex]);

  useEffect(() => {
    cardsRefs.current = cardsRefs.current.slice(0, musicData.length);
  }, []);

  return (
    <div className="music-container">
      <div className="container-svg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          width="100%"
          height="550px"
          viewBox="0 0 1920 1920"
          preserveAspectRatio="none"
        >
          <path
            d="M1468.235 0v112.941H451.765V0H0v451.878h112.941v1016.47H0V1920h451.765v-112.941h1016.47V1920h451.878v-451.652h-112.941V451.878h112.94V0h-451.877Zm113.054 338.824h225.883V112.94h-225.883v225.883Zm-1468.348 0h225.883V112.94H112.94v225.883Zm112.941 113.054h225.883V225.882h1016.47v225.996h225.996v1016.47h-225.996v225.77H451.765v-225.77H225.882V451.878Zm1355.407 1355.18h225.883v-225.882h-225.883v225.883Zm-1468.348 0h225.883v-225.882H112.94v225.883Z"
            fillRule="evenodd"
          />

          {/* Path untuk animasi ular */}
          <path
            className="snake-path"
            d="M1468.235 0v112.941H451.765V0H0v451.878h112.941v1016.47H0V1920h451.765v-112.941h1016.47V1920h451.878v-451.652h-112.941V451.878h112.94V0h-451.877Zm113.054 338.824h225.883V112.94h-225.883v225.883Zm-1468.348 0h225.883V112.94H112.94v225.883Zm112.941 113.054h225.883V225.882h1016.47v225.996h225.996v1016.47h-225.996v225.77H451.765v-225.77H225.882V451.878Zm1355.407 1355.18h225.883v-225.882h-225.883v225.883Zm-1468.348 0h225.883v-225.882H112.94v225.883Z"
            fill="none"
            stroke="red"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* Card Stack */}
      <div
        className="cards-stack"
        ref={cardStackRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {musicData.map((song, index) => (
          <div
            key={song.id}
            className={`card ${index === currentSongIndex ? "active" : ""}`}
            onClick={() => index !== currentSongIndex && changeSong(index)}
            ref={(el) => (cardsRefs.current[index] = el)}
          >
            <img src={song.cover} alt={song.title} />
            <div className="card-content">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <audio
          ref={audioRef}
          src={musicData[currentSongIndex].file}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(formatTime(audioRef.current.duration));
            }
          }}
        />

        <div className="song-info">
          <h2>{musicData[currentSongIndex].title}</h2>
          <p>{musicData[currentSongIndex].artist}</p>
        </div>

        <div className="heart-icon">
          <span>❤️</span>
        </div>

        <div className="progress-container">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="time-display">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>

        <div className="controls">
          <button onClick={handlePrev} aria-label="Previous">
            <span className="control-icon">◀◀</span>
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="play-button"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={handleNext} aria-label="Next">
            <span className="control-icon">▶▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
