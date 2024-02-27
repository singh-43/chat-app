import * as React from "react";

const AudioProgressBar = ( props ) => {
    
    const { duration, currrentProgress, buffered, ...rest } = props;
    const progressBarWidth = isNaN(currrentProgress / duration)
    ? 0
    : currrentProgress / duration;
    const bufferedWidth = isNaN(buffered / duration) ? 0 : buffered / duration;

    const progressStyles = {
    "--progress-width": progressBarWidth,
    "--buffered-width": bufferedWidth,
    };

    return (
        <div className="flex">
            <input
                type="range"
                name="progress"
                style={progressStyles}
                min={0}
                max={duration}
                value={currrentProgress}
                {...rest}
                className="h-1"
            />
        </div>
    );
}

export default AudioProgressBar;