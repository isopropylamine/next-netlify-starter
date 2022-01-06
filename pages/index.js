import Head from "next/head";
import React from "react";
import { useState, useEffect } from "react";
import _ from "lodash";

const Home = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [bestTimes, setBestTimes] = useState();
  const [error, setError] = useState();
  const [totalDays, setTotalDays] = useState();

  const API_KEY = "oJAKhAGysdLDX4xrHja2IozkxPFMx9CJ";

  useEffect(() => {
    if (ticker) {
      fetchData(ticker);
    }
  }, [ticker]);

  const fetchData = (tickerSymbol) => {
    setLoading(true);

    let currentMilliseconds = new Date().getTime();
    let pastMilliseconds = currentMilliseconds - 2629800000;

    let count = 1;

    const fetchedData = [];

    while (count < 13) {
      const convertedCurrent = new Date(currentMilliseconds)
        .toISOString()
        .split("T")[0];
      const convertedPast = new Date(pastMilliseconds)
        .toISOString()
        .split("T")[0];

      const apiString = `https://api.polygon.io/v2/aggs/ticker/${tickerSymbol}/range/1/hour/${convertedPast}/${convertedCurrent}?&sort=asc&limit=50000&apiKey=${API_KEY}`;

      fetch(apiString)
        .then((response) => response.json())
        .then(({ results }) => {
          console.log("fetching...");
          results.forEach(({ h, t }) => {
            let time = new Date(t).toISOString().split("T")[1].split(":")[0];

            if (Number(time) <= 17 && Number(time) > 8) {
              if (Number(time) > 12) {
                time = `${Number(time) - 12}:00`;
              }

              if (Number(time) < 12) {
                if (Number(time) === 9) {
                  time = "9:30";
                }

                if (Number(time) > 9) time = `${Number(time)}:00`;
              }

              if (Number(time) === 12) {
                time = "12:00";
              }

              fetchedData.push({
                time,
                price: h,
                date: new Date(t).toISOString().split("T")[0],
              });
            }
          });
        })
        .catch((error) => {
          setLoading(false);
          setError(error);
        });

      currentMilliseconds = pastMilliseconds;
      pastMilliseconds -= 2629800000;
      count += 1;
    }

    setTimeout(() => {
      parseData(fetchedData);
    }, 2500);
  };

  const parseData = (data) => {
    console.log("parsing...");
    const bestTimeObject = {
      "1:00": 0,
      "2:00": 0,
      "3:00": 0,
      "4:00": 0,
      "5:00": 0,
      "9:30": 0,
      "10:00": 0,
      "11:00": 0,
      "12:00": 0,
    };
    let dayCount = 0;
    let currentDate = data[0].date;

    let temporaryTimes = {};

    data.forEach(({ time, price, date }) => {
      if (date !== currentDate) {
        currentDate = date;
        dayCount += 1;

        //calculate the best time
        let maxValue = 999999999999;
        let maxKey = "";

        Object.keys(temporaryTimes).forEach((key) => {
          const value = Number(temporaryTimes[key]);
          if (value < maxValue) {
            maxValue = value;
            maxKey = key;
          }
        });

        bestTimeObject[maxKey] += 1;

        temporaryTimes = {};
      }

      temporaryTimes[time] = Number(price);
    });

    setBestTimes(bestTimeObject);
    setTotalDays(dayCount);
    setLoading(false);
  };

  const renderSelect = () => {
    if (error) {
      return error;
    }

    if (loading) {
      return null;
    }

    return (
      <select value={ticker} onChange={({ target }) => setTicker(target.value)}>
        <option value={"SPY"}>SPY</option>
        <option value={"QQQ"}>QQQ</option>
        <option value={"TQQQ"}>TQQQ</option>
        <option value={"XLK"}>XLK</option>
        <option value={"TSLA"}>TSLA</option>
        <option value={"FB"}>FB</option>
        <option value={"GOOG"}>GOOG</option>
        <option value={"AAPL"}>AAPL</option>
        <option value={"SNAP"}>SNAP</option>
        <option value={"TWTR"}>TWTR</option>
        <option value={"ARKG"}>ARKG</option>
        <option value={"GS"}>GS</option>
      </select>
    );
  };

  const renderCaption = () => {
    if (loading) {
      return (
        <>
          <p className="loading">Loading and calculating statistics...</p>
          <style jsx>{`
            .loading {
              line-height: 1.5;
              font-size: 1.5rem;
              animation: move 0.5s infinite;
              transition: 0.1s;
            }

            @keyframes move {
              0% {
                transform: translateX(10px);
              }
              49% {
                transform: translateX(20px);
              }
              50% {
                transform: translateX(20px);
              }
              100% {
                transform: translateX(10px);
              }
            }
          `}</style>
        </>
      );
    }

    if (!bestTimes && !totalDays) {
      return (
        <>
          <p className="description">
            <>
              Select a stock ticker, and I'll go through the past year and
              calculate it for you!
            </>
            <br />
            <>(Past trends don't guarantee future trends thoooooooo)</>
          </p>
          <style jsx>{`
            .description {
              line-height: 1.5;
              font-size: 1.5rem;
            }
          `}</style>
        </>
      );
    }

    const bestTimesArray = Object.keys(bestTimes)
      .map((key) => ({
        key,
        times: bestTimes[key],
      }))
      .sort((a, b) => b.times - a.times);

    const absoluteBest = bestTimesArray[0];
    const secondBest = bestTimesArray[1];

    return (
      <>
        <p className="description">
          <>
            {`${((100 * absoluteBest.times) / totalDays).toFixed(
              2
            )}% of the time, the best time to buy the ${ticker} is at ${
              absoluteBest.key
            }!`}
          </>
          <br />
          <>{`Btw, ${((100 * secondBest.times) / totalDays).toFixed(
            2
          )}% of the time, it would be better to buy at ${secondBest.key}`}</>
        </p>
        <style jsx>{`
          .description {
            line-height: 1.5;
            font-size: 1.5rem;
          }
        `}</style>
      </>
    );
  };

  return (
    <div className="container">
      <Head>
        <title>Backtesting is fun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Let's backtest the best time for a recurring purchase!
        </h1>
        {renderCaption()}
        {renderSelect()}
      </main>

      <footer>haha, not financial advice</footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Home;
