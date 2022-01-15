import Head from "next/head";

import React, { useEffect, useState } from "react";
import _ from "lodash";

import { wordsDictionary } from "./words";
import { LetterComponent } from "./letterComponent";

export default function Home() {
  const [operationMap, setOperationMap] = useState({});
  const [currentWords, setCurrentWords] = useState(wordsDictionary);
  //This is a list of letters and positions which are forbidden (yellow) [2, "a"]
  const [forbiddenLetters, setForbiddenLetters] = useState();
  //This is a list of letters and positions which are known (green) [3, "g"]
  const [forbiddenLocations, setForbiddenLocations] = useState();
  const [knownLetters, setKnownLetters] = useState();
  const [letters, setLetters] = useState([
    ["arose"],
    ["until"],
    [],
    [],
    [],
    [],
  ]);
  const [nextStep, setNextStep] = useState(false);
  const [oops, setOops] = useState(false);

  const letterAnalyzer = (wordList, position) => {
    const letterSet = {
      q: 0,
      w: 0,
      e: 0,
      r: 0,
      t: 0,
      y: 0,
      u: 0,
      i: 0,
      o: 0,
      p: 0,
      a: 0,
      s: 0,
      d: 0,
      f: 0,
      g: 0,
      h: 0,
      j: 0,
      k: 0,
      l: 0,
      z: 0,
      x: 0,
      c: 0,
      v: 0,
      b: 0,
      n: 0,
      m: 0,
    };

    wordList.forEach((word) => {
      const letter = word[position];

      letterSet[letter] = letterSet[letter] + 1;
    });

    return letterSet;
  };

  const calculateLikelihoodOfWords = (allowedWords) => {
    //For each position, calculate a likelihood table
    const position0 = letterAnalyzer(allowedWords, 0);
    const position1 = letterAnalyzer(allowedWords, 1);
    const position2 = letterAnalyzer(allowedWords, 2);
    const position3 = letterAnalyzer(allowedWords, 3);
    const position4 = letterAnalyzer(allowedWords, 4);

    let greatestWord = "";
    let greatestScore = 0;

    //For each allowed word, calculate the likelihood score, which is the likelihood of every letter
    allowedWords.forEach((currentWord) => {
      let wordScore = 0;

      Array.from(currentWord).forEach((letter, index) => {
        if (index === 0) {
          wordScore += position0[letter];
          return;
        }
        if (index === 1) {
          wordScore += position1[letter];
          return;
        }
        if (index === 2) {
          wordScore += position2[letter];
          return;
        }
        if (index === 3) {
          wordScore += position3[letter];
          return;
        }
        if (index === 4) {
          wordScore += position4[letter];
          return;
        }
      });
      if (wordScore > greatestScore) {
        greatestScore = wordScore;
        greatestWord = currentWord;
      }
    });

    let settingIndex = 0;
    letters.forEach((individualLetter, index) => {
      if (_.isEmpty(individualLetter) && settingIndex === 0) {
        settingIndex = index;
      }
    });

    const lettersCopy = [...letters];
    lettersCopy[settingIndex] = [greatestWord];

    setForbiddenLetters([]);
    setLetters(lettersCopy);
    setNextStep(false);
  };

  const filterWords = () => {
    const wordCheckList = [];

    currentWords.map((currentWord) => {
      if (forbiddenLetters.every((letter) => !currentWord.includes(letter))) {
        if (
          forbiddenLocations.every((location) => {
            const forbiddenLocation = location[0];
            const forbiddenLocationLetter = location[1];

            if (!!!forbiddenLocations.length) {
              return true;
            }

            if (currentWord[forbiddenLocation] === forbiddenLocationLetter) {
              return false;
            }

            return true;
          })
        ) {
          if (forbiddenLetterExistenceCheck) {
            if (knownLetterCheck(currentWord)) {
              wordCheckList.push(currentWord);
            }
          }
        }
      }
    });

    calculateLikelihoodOfWords(wordCheckList);
    setCurrentWords(wordCheckList);
  };

  const forbiddenLetterExistenceCheck = (word) => {
    //word needs to include all of the letters

    return forbiddenLocations.every((letterTuple) => {
      const letterTupleLetter = letterTuple[1];
      word.includes(letterTupleLetter);
    });
  };

  const knownLetterCheck = (word) => {
    if (
      knownLetters.every((knownLetter) => {
        const knownLocation = knownLetter[0];
        const knownLocationLetter = knownLetter[1];

        if (knownLocationLetter === word[knownLocation]) {
          return true;
        }

        if (!!!knownLetters.length) {
          return true;
        }
        if (word[knownLocation] !== knownLocationLetter) {
          return false;
        }
      })
    ) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const totalWords = letters.filter(
      (guessedWords) => !_.isEmpty(guessedWords)
    ).length;

    const colouredWords = Object.keys(operationMap).length;

    if (colouredWords / 5 > 5) {
      setOops(true);
      return;
    }

    if (colouredWords / 5 === totalWords) {
      //go through all the operations and set the respective fields

      const temporaryForbiddenLetters = [];
      const temporaryForbiddenLocations = [];
      const temporaryKnownLetters = [];
      const goodLetters = [];

      Object.keys(operationMap).forEach((key) => {
        const currentData = operationMap[key];

        const operatedIndex = currentData[1];
        const operatedLetter = currentData[0][operatedIndex];
        const operation = currentData[2];

        if (operation === "green") {
          temporaryKnownLetters.push([operatedIndex, operatedLetter]);
          goodLetters.push(operatedLetter);
        }
        if (operation === "yellow") {
          temporaryForbiddenLocations.push([operatedIndex, operatedLetter]);
        }
        if (operation === "gray") {
          temporaryForbiddenLetters.push(operatedLetter);
        }
      });

      //BUG ALERT
      //If a word is BOTH within the known letters, it cannot be in the forbidden letters in the case of a double letter

      //Maybe have that as a forbidden location in the future?

      //for now, just filter it out

      const filteredForbiddenLetters = temporaryForbiddenLetters.filter(
        (filteredForbidden) => {
          return !goodLetters.includes(filteredForbidden);
        }
      );

      setForbiddenLetters(filteredForbiddenLetters);
      setForbiddenLocations(temporaryForbiddenLocations);
      setKnownLetters(temporaryKnownLetters);

      setNextStep(true);
    }
  }, [operationMap]);

  useEffect(() => {
    if (nextStep && !oops) filterWords();
  }, [forbiddenLocations, forbiddenLetters, knownLetters]);

  const renderKeyboard = () => {
    const letterSet = {
      q: "lightgray",
      w: "lightgray",
      e: "lightgray",
      r: "lightgray",
      t: "lightgray",
      y: "lightgray",
      u: "lightgray",
      i: "lightgray",
      o: "lightgray",
      p: "lightgray",
      a: "lightgray",
      s: "lightgray",
      d: "lightgray",
      f: "lightgray",
      g: "lightgray",
      h: "lightgray",
      j: "lightgray",
      k: "lightgray",
      l: "lightgray",
      z: "lightgray",
      x: "lightgray",
      c: "lightgray",
      v: "lightgray",
      b: "lightgray",
      n: "lightgray",
      m: "lightgray",
    };

    Object.values(operationMap).forEach((operation) => {
      const key = operation[0][operation[1]];
      const color = operation[2];

      letterSet[key] = color;
    });

    return (
      <div className="keyboardContainer">
        <div className="keyboardRow">
          <div className={`keyboardSquare ${letterSet["q"]}Box`}>q</div>
          <div className={`keyboardSquare ${letterSet["w"]}Box`}>w</div>
          <div className={`keyboardSquare ${letterSet["e"]}Box`}>e</div>
          <div className={`keyboardSquare ${letterSet["r"]}Box`}>r</div>
          <div className={`keyboardSquare ${letterSet["t"]}Box`}>t</div>
          <div className={`keyboardSquare ${letterSet["y"]}Box`}>y</div>
          <div className={`keyboardSquare ${letterSet["u"]}Box`}>u</div>
          <div className={`keyboardSquare ${letterSet["i"]}Box`}>i</div>
          <div className={`keyboardSquare ${letterSet["o"]}Box`}>o</div>
          <div className={`keyboardSquare ${letterSet["p"]}Box`}>p</div>
        </div>
        <div className="keyboardRow">
          <div className={`keyboardSquare ${letterSet["a"]}Box`}>a</div>
          <div className={`keyboardSquare ${letterSet["s"]}Box`}>s</div>
          <div className={`keyboardSquare ${letterSet["d"]}Box`}>d</div>
          <div className={`keyboardSquare ${letterSet["f"]}Box`}>f</div>
          <div className={`keyboardSquare ${letterSet["g"]}Box`}>g</div>
          <div className={`keyboardSquare ${letterSet["h"]}Box`}>h</div>
          <div className={`keyboardSquare ${letterSet["k"]}Box`}>j</div>
          <div className={`keyboardSquare ${letterSet["k"]}Box`}>k</div>
          <div className={`keyboardSquare ${letterSet["l"]}Box`}>l</div>
        </div>
        <div className="keyboardRow">
          <div className={`keyboardSquare ${letterSet["z"]}Box`}>z</div>
          <div className={`keyboardSquare ${letterSet["x"]}Box`}>x</div>
          <div className={`keyboardSquare ${letterSet["c"]}Box`}>c</div>
          <div className={`keyboardSquare ${letterSet["v"]}Box`}>v</div>
          <div className={`keyboardSquare ${letterSet["b"]}Box`}>b</div>
          <div className={`keyboardSquare ${letterSet["n"]}Box`}>n</div>
          <div className={`keyboardSquare ${letterSet["m"]}Box`}>m</div>
        </div>
      </div>
    );
  };

  const renderGrid = () => {
    const renderLetters = (word) => {
      return Array.from(word).map((wordLetter, index) => {
        return (
          <LetterComponent
            word={word}
            index={index}
            map={operationMap}
            setFunction={setOperationMap}
          />
        );
      });
    };

    return letters.map((word) => {
      if (_.isEmpty(word)) {
        return (
          <div className="rowContainer">
            <div className="letterContainer"></div>
            <div className="letterContainer"></div>
            <div className="letterContainer"></div>
            <div className="letterContainer"></div>
            <div className="letterContainer"></div>
          </div>
        );
      }

      return <div className="rowContainer">{renderLetters(word[0])}</div>;
    });
  };

  const renderPrompt = () => {
    if (oops) {
      return (
        <div className="prompt">
          Hmmm, I don't know that word! You've stumped me!
        </div>
      );
    }

    const totalWords = letters.filter(
      (guessedWords) => !_.isEmpty(guessedWords)
    ).length;

    if (totalWords === 2) {
      return (
        <div className="prompt">
          Enter these two words into Wordle, and then set their colours by
          clicking on them!
        </div>
      );
    }

    const currentWord = letters[totalWords - 1];

    return (
      <div className="prompt">
        {`I think the next word might be ${currentWord[0].toUpperCase()}!`}
      </div>
    );
  };

  return (
    <div className="mainContainer">
      <Head>
        <title className="title">Solve Wordle!</title>
      </Head>

      <main>
        <h1 className="title">Wordle Solver!</h1>
        {renderPrompt()}
        <div className="gridContainer">{renderGrid()}</div>
        {renderKeyboard()}
      </main>

      <div className="footer">
        this was made by a software engineer at 10xGenomics who really enjoys
        wordle
      </div>

      <style jsx>{`
        .mainContainer {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 95%;
        }

        .title {
          display: flex;
          justify-content: center;
        }

        .footer {
          display: flex;
          justify-content: center;
          font-style: italic;
          color: gray;
        }

        .gridContainer {
          margin-top: 2rem;
        }
      `}</style>

      <style jsx global>{`

        .keyboardContainer {
          margin-top: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .keyboardRow {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          justify-content: center;
        }

        .letterContainer {
          width: 2rem;
          height: 2rem;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid lightgray;
          flex-direction: column;
          text-transform: uppercase;
          font-weight: 700;
        }

        .keyboardSquare {
          width: 2rem;
          height: 2rem;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid lightgray;
          flex-direction: column;
          text-transform: uppercase;
          font-weight: 700;
        }

        .popoverContainer {
          display: flex;
          flex-direction: row;
          padding .5rem;
          gap: .5rem;
          margin-bottom: .5rem;
        }

        .graySquare {
          background-color: gray;
        }

        .yellowSquare {
          background-color: #c9b458;
        }

        .greenSquare {
          background-color: #6aaa64;
        }

        .grayBox {
          background-color: gray;
          color: white;
        }

        .yellowBox {
          background-color: #c9b458;
          color: white;
        }

        .greenBox {
          background-color: #6aaa64;
          color: white;
        }

        .square {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid white;
          box-shadow: 10px 5px 5px gray;
        }

        .square:hover {
          border: 2px solid black;
        }

        .prompt {
          display: flex;
          justify-content: center;
          width: 70vw;
          font-size: 1.25rem;
        }

        .letterContainer:hover {
          border: 2px solid black;
        }

        .rowContainer {
          display: flex;
          flex-direction: row;
          padding: 0.15rem;
          gap: 0.3rem;
          justify-content: center;
        }

        body {
          display: flex;
          height: 100vh;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
      `}</style>
    </div>
  );
}
