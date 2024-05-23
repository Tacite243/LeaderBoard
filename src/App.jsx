import { useState } from "react";
import "./App.css";

function App() {
  const [usernames, setUsernames] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultWikipedia, setResultWikipedia] = useState([]);
  const [resultCount, setResultCount] = useState(-1);
  const [resultCommons, setResultCommons] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const usernameArray = usernames.split(",").map((name) => name.trim());

    const contributionsByUser = await Promise.all(
      usernameArray.map(async (username) => {
        const response = await fetch(
          `https://fr.wikipedia.org/w/api.php?action=query&list=usercontribs&ucuser=${username}&uclimit=500&ucprop=title|timestamp&format=json&origin=*`
        );
        const data = await response.json();
        const contributions = data.query.usercontribs.filter((contribution) => {
          const contributionDate = new Date(contribution.timestamp);
          return (
            contributionDate >= new Date(startDate) &&
            contributionDate <= new Date(endDate)
          );
        });
        return { username, contributions };
      })
    );

    const allContributions = contributionsByUser.flatMap((user) => user.contributions);
    setResultWikipedia(allContributions);
    setResultCount(allContributions.length);

    setLoading(false);
    setResultCommons("Résultats Commons...");
  };

  function dateformat(date) {
    const [datePart, timePart] = date.split("T");
    const formattedDate = datePart.split("-").reverse().join("-");
    const formattedTime = timePart.replace("Z", "");
    return `${formattedDate} ${formattedTime}`;
  }

  return (
    <div className="container">
      <h1>Comparer les contributions Wikipedia </h1>
      <div className="form-container">
        <form id="userForm" onSubmit={handleSubmit}>
          <label htmlFor="usernames">
            Noms d'utilisateur (séparés par des virgules):
          </label>
          <input
            type="text"
            id="usernames"
            name="usernames"
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            required
          />

          <label htmlFor="startDate">Date de début:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label htmlFor="endDate">Date de fin:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <button type="submit">Comparer</button>
        </form>
        <div>
          {loading && <div id="loader" className="loader"></div>}
          <div id="resultWikipedia">
            {resultCount < 0 ? (
              "the result will be displayed here"
            ) : resultWikipedia.length === 0 ? (
              "there is not result for that user"
            ) : (
              <>
                <h4 className="resultTitle">
                  The result for the user {usernames} are {resultWikipedia.length}
                </h4>
                <div className="result">
                  <h5>Username</h5>
                  <h5>Title</h5>
                  <h5>Date</h5>
                </div>
                {resultWikipedia.map((el, index) => (
                  <div key={index} className="result">
                    <h6>{el.user}</h6>
                    <h6>{el.title}</h6>
                    <h6>{dateformat(el.timestamp)}</h6>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
