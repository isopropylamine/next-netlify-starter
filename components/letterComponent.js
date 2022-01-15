import React, { useState } from "react";
import { Popover } from "react-tiny-popover";

export const LetterComponent = ({ word, index, map, setFunction }) => {
  const key = word + index;

  /*
    Each letter component has a unique key
    This key is the word + the index

    there's a map that it can get data from, and then it'll change that map into things

    have a useEffect that happens whenever the map changes, it'll check the length and the current step, and then guess the next word


    */

  const [isPopoverOpen, setIsPopverOpen] = useState(false);
  const [color, setColor] = useState();

  const renderPopoverContent = () => (
    <div className="popoverContainer">
      <div
        onClick={() => {
          const mapCopy = { ...map };
          mapCopy[key] = [word, index, "gray"];

          setFunction(mapCopy);
          setIsPopverOpen(false);
          setColor("grayBox");
        }}
        className="square graySquare"
      ></div>
      <div
        onClick={() => {
          const mapCopy = { ...map };
          mapCopy[key] = [word, index, "yellow"];

          setFunction(mapCopy);
          setIsPopverOpen(false);
          setColor("yellowBox");
        }}
        className="square yellowSquare"
      ></div>
      <div
        onClick={() => {
          const mapCopy = { ...map };
          mapCopy[key] = [word, index, "green"];

          setFunction(mapCopy);
          setIsPopverOpen(false);
          setColor("greenBox");
        }}
        className="square greenSquare"
      ></div>
    </div>
  );

  return (
    <Popover
      isOpen={isPopoverOpen}
      position={["top", "bottom", "left", "right"]}
      content={renderPopoverContent()}
    >
      <div
        onClick={() => setIsPopverOpen(!isPopoverOpen)}
        className={`letterContainer ${color}`}
      >
        {word[index]}
      </div>
    </Popover>
  );
};
