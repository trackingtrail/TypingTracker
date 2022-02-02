import { useCallback, useEffect, useRef, useState } from "react";
import useKey from "../hooks/useKey";
import TextCharacter from "./Typography/TextCharacter";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";
import Loader from "./Loaders/Loader";

const WPMTextArea = ({ mainText }) => {
  //Declaring states with useState hooks
  const toTypeState = {
    charIndex: -1,
    charsTyped: [],
  };
  const [typingState, setTypingState] = useState(toTypeState);
  const [charsToType, setCharsToType] = useState([]);
  const [secondsTime, setSecondsTime] = useState(0);
  //   const [incorrectWords, setIncorrectWords] = useState(0);

  //Declaring references (timer & text by lines)
  const timer = useRef(null);
  const mainTextLines = useRef(mainText.split("\n"));

  const mainContainer = {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    margin: "auto",
    width: "1100px",
    fontSize: "35px",
  };

  const infoContainer = {
    float: "inherit",
    fontSize: "40px",
  };

  const scrollAble = {
    overflowY: "scroll",
    overflowX: "hidden",
    overflow: "hidden",
    userSelect: "none",
    height: "140px",
    marginTop: "100px",
  };

  const lineDiv = {
    marginBottom: "8px",
    wordWrap: "break-word",
  };

  //using the useKey hook
  useKey((key) => {
    if (key !== "Backspace") {
      setTypingState((prevTypingState) => {
        return {
          ...prevTypingState,
          charsTyped: [...prevTypingState.charsTyped, key],
        };
      });
    } else {
      setTypingState((prevTypingState) => {
        return {
          ...prevTypingState,
          charsTyped: prevTypingState.charsTyped.filter(
            (_, i) => i !== prevTypingState.charsTyped.length - 1
          ),
        };
      });
    }
  });

  const startTimer = useCallback(() => {
    if (timer.current !== null) {
      return;
    }

    var startInterval = Date.now();
    timer.current = setInterval(() => {
      var timeStamped = Date.now() - startInterval;
      setSecondsTime(timeStamped / 1000);
    }, 1000);
  }, []);

  const stopTimer = useCallback((e) => {
    clearInterval(timer.current);
    timer.current = null;
    if (e && e.preventDefault) {
      e.preventDefault();
    }
  }, []);

  const lineToChars = useCallback((line) => {
    return line
      .trim()
      .concat(" ")
      .split("")
      .map((c) => c);
  }, []);

  useEffect(
    (e) => {
      const characters = mainTextLines.current
        .map((line) => lineToChars(line))
        .flat();
      setCharsToType(characters);
      let cursor = document.getElementById("cursor");

      const cursorScrolling = () => {
        let cursorLocation = cursor.parentNode;
        cursorLocation.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "start",
        });
      };

      //sets cursor position and range
      const cursorPosition = () => {
        var range = document.createRange();
        var sel = window.getSelection();

        range.setStart(cursor.childNodes[0], cursor.length);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
      };

      const timerCheck = () => {
        if (typingState.charsTyped.length >= 1) {
          startTimer();
        }

        if (
          timer.current &&
          charsToType.length - 1 <= typingState.charsTyped.length
        ) {
          stopTimer(e);
        }

        if (typingState.charsTyped.length < 1) {
          stopTimer(e);
          setSecondsTime(0);
        }
      };

      cursorScrolling();
      cursorPosition();
      timerCheck();
    },
    [
      typingState.charsTyped,
      lineToChars,
      charsToType.length,
      startTimer,
      stopTimer,
    ]
  );

  let charCount = -1;

  const correct = typingState.charsTyped.reduce((acc, chr, i) => {
    return chr === charsToType[i] ? acc + 1 : acc;
  }, 0);

  const incorrect = typingState.charsTyped.reduce((inacc, inaccChar, j) => {
    return inaccChar !== charsToType[j] ? inacc + 1 : inacc;
  }, 0);

  const accuracy = (correct / typingState.charsTyped.length) * 100;
  const accurateText = `${accuracy.toFixed(0)}`;
  const wpm = typingState.charsTyped.length / 5 / (secondsTime / 60);
  const inAccuracy = (
    (incorrect / typingState.charsTyped.length) *
    100
  ).toFixed(0);

  return (
    <>
      <div style={mainContainer}>
        <div style={scrollAble} className="scrollableDiv">
          {mainTextLines.current.map((line, i) => (
            <div style={lineDiv} key={i}>
              {lineToChars(line).map((chr) => {
                charCount += 1;
                return (
                  <TextCharacter
                    chr={chr}
                    key={charCount}
                    id={charCount}
                    charsTyped={typingState.charsTyped}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={infoContainer}>
        {/* <kbd>{incorrectWords} </kbd> */}
        {/* <kbd>{`Inacc:${isNaN(inAccuracy) ? 0 : inAccuracy}`} </kbd> */}
        {/* <kbd>{`${isNaN(accuracy) ? 0 : accurateText}%`} </kbd> */}
        {/* <kbd>{`WPM:${isNaN(wpm) || !isFinite(wpm) ? 0 : wpm.toFixed(0)}`} </kbd> */}
        <div style={{ width: 100, height: 100 }}>
          {/* <CircularProgressbar
            maxValue={60}
            value={secondsTime.toFixed(0)}
            text={`${secondsTime.toFixed(0)}`}
            styles={{
              path: {
                stroke: "#ff79c6",
              },
              trail: {
                // Trail color
                stroke: "#fff",
              },
              text: {
                // Text color
                fill: "#ff79c6",
                // Text size
                fontSize: "32px",
              },
            }}
          /> */}
        </div>
      </div>
    </>
  );
};

const WPMTextContainer = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState("");
  useEffect(() => {
    const delay = async (sec) => {
      return await new Promise((resolve) => setTimeout(resolve, sec));
    };
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: response } = await axios.get(
          "https://random-word-api.herokuapp.com/word?number=200"
        );
        var s = response.slice(0, response.length - 1).join(" ");
        setData(s.replace(/(?![^\n]{1,51}$)([^\n]{1,51})\s/g, "$1\n"));
      } catch (error) {
        console.error(error);
      }
	  setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading && <Loader />}
      {!loading && <WPMTextArea mainText={data} />}
    </div>
  );
};

export default WPMTextContainer;
