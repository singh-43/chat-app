const VolumeInput = (props) => {

    const { volume, onVolumeChange } = props;

    return (
      <input
        aria-label="volume"
        name="volume"
        type="range"
        min={0}
        step={0.05}
        max={1}
        value={volume}
        className="w-[60px] m-0 h-1 rounded-lg cursor-pointer"
        onChange={(e) => {
          onVolumeChange(e.currentTarget.valueAsNumber);
        }}
      />
    );
}

export default VolumeInput;