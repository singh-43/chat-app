import VolumeInput from "../VolumeInput";
import { CgSpinner } from "react-icons/cg";
import React, { useRef, useState } from "react";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";
import { MdPlayArrow, MdPause } from "react-icons/md";
import AudioProgressBar from "../AudioProgressBar";
import IconButton from "../IconButton";

const AudioPlayer = ({ messageUrl, messageExt }) => {

    const [volume, setVolume] = useState(0.2);
    const [buffered, setBuffered] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currrentProgress, setCurrrentProgress] = useState(0);

    const handleVolumeChange = (volumeValue) => {
        if (!audioRef.current) return;
        audioRef.current.volume = volumeValue;
        setVolume(volumeValue);
    };

    const togglePlayPause = () => {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setIsPaused(true);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    };

    const handleMuteUnmute = () => {
        if (!audioRef.current) return;
        if (audioRef.current.volume !== 0) {
          audioRef.current.volume = 0;
        } else {
          audioRef.current.volume = 1;
        }
    };

    const formatDurationDisplay = (duration) => {
        const min = Math.floor(duration / 60);
        const sec = Math.floor(duration - min * 60);
        const formatted = [min, sec].map((n) => (n < 10 ? "0" + n : n)).join(":"); // format - mm:ss
        return formatted;
    }

    const durationDisplay = formatDurationDisplay(duration);
    const elapsedDisplay = formatDurationDisplay(currrentProgress);

    const handleBufferProgress = (e) => {
        const audio = e.currentTarget;
        const dur = audio.duration;
        if (dur > 0) {
          for (let i = 0; i < audio.buffered.length; i++) {
            if (
              audio.buffered.start(audio.buffered.length - 1 - i) < audio.currentTime
            ) {
              const bufferedLength = audio.buffered.end(
                audio.buffered.length - 1 - i,
              );
              setBuffered(bufferedLength);
              break;
            }
          }
        }
    };

    const audioRef = useRef(null);

    return (
        <div className="absolute top-[30px] left-[42px]">
            <audio ref={audioRef} preload='metadeta' className='hidden' controls
                onCanPlay={(e) => {
                    setIsReady(true);
                    e.currentTarget.volume = volume;
                }}
                onPlaying={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onProgress={handleBufferProgress}
                onVolumeChange={(e) => setVolume(e.currentTarget.volume)}
                onTimeUpdate={(e) => {
                    setCurrrentProgress(e.currentTarget.currentTime);
                    handleBufferProgress(e);
                }}
                onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            >
                <source src={messageUrl} type={"audio/" + messageExt} />
            </audio>
            <div className="flex gap-[2px] items-center">
                <IconButton
                    disabled={!isReady}
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    size="lg"
                >
                    {!isReady ? (
                    <CgSpinner size={24} className="animate-spin" />
                    ) : isPlaying ? (
                    <MdPause size={24} />
                    ) : (
                    <MdPlayArrow size={24} />
                    )}
                </IconButton>
                <AudioProgressBar currrentProgress={currrentProgress} 
                    duration={duration} buffered={buffered}
                    onChange={(e) => {
                        if (!audioRef.current) return;
                        audioRef.current.currentTime = e.currentTarget.valueAsNumber;
                        setCurrrentProgress(e.currentTarget.valueAsNumber);
                    }}
                />
                <span className="text-xs absolute -bottom-[8px] -left-[31px]">
                    { ( isPlaying || isPaused ) ? elapsedDisplay : durationDisplay}
                    {/* {elapsedDisplay} / {durationDisplay} */}
                </span>
                <div id="volume-button" className="ml-1 flex">
                    <IconButton
                        intent="secondary"
                        size="sm"
                        onClick={handleMuteUnmute}
                        aria-label={volume === 0 ? "unmute" : "mute"}
                    >
                        {   volume === 0 ? 
                            <MdVolumeOff size={20} color="" /> : 
                            <MdVolumeUp size={20} color="" />
                        }
                    </IconButton>
                </div>
            </div>
        </div>
    );
}

export default AudioPlayer;