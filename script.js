const matchesContainer = document.getElementById("matches-container");
const addMatch = document.querySelector(".lws-addMatch");
const resetMatches = document.querySelector(".lws-reset");
const result = document.querySelector(".total");

const initialState = {
  matches: [
    {
      incrementScore: 0,
      decrementScore: 0,
      totalScore: 0,
      id: Date.now(),
    },
  ],
};

function scoreReducer(state = initialState, action) {
  switch (action.type) {
    case "ADD_MATCH":
      const match = {
        incrementScore: 0,
        decrementScore: 0,
        totalScore: 0,
        id: Date.now(),
      };
      return {
        ...state,
        matches: [...state.matches, match],
      };
    case "DELETE_MATCH":
      const matchId = action.payload;
      return {
        ...state,

        matches: state.matches.filter((match) => match.id != matchId),
      };
    case "UPDATE_SCORES":
      const { incrementScore, decrementScore } = action.payload;
      const matchIndex = state.matches.findIndex(
        (match) => match.id == action.payload.matchId
      );
      const updatedMatch = {
        ...state.matches[matchIndex],
        incrementScore,
        decrementScore,
        totalScore: Math.max(0, incrementScore - decrementScore),
      };
      const updatedMatches = [...state.matches];
      updatedMatches[matchIndex] = updatedMatch;
      return {
        ...state,
        matches: updatedMatches,
      };
    case "RESET_MATCH":
      return {
        matches: state.matches.map((match) => ({
          ...match,
          incrementScore: 0,
          decrementScore: 0,
          totalScore: 0,
        })),
      };
    default:
      return state;
  }
}

const store = Redux.createStore(scoreReducer);

function render() {
  matchesContainer.innerHTML = ""; // clear the container first

  store.getState().matches.forEach((match) => {
    matchesContainer.innerHTML += `
      <div class="match" data-match-id="${match.id}">
        <div class="wrapper">
          <button class="lws-delete" data-match-id="${match.id}">
            <img src="./image/delete.svg" alt="" />
          </button>
          <h3 class="lws-matchName">Match ${
            store.getState().matches.findIndex((ma) => ma.id == match.id) + 1
          }</h3>
        </div>
        <div class="inc-dec">
          <form class="incrementForm">
            <h4>Increment</h4>
            <input
              type="number"
              name="increment"
              class="lws-increment"
              value="${match.incrementScore}"
              data-match-id="${match.id}"
            />
          </form>
          <form class="decrementForm">
            <h4>Decrement</h4>
            <input
              type="number"
              name="decrement"
              class="lws-decrement"
              value="${match.decrementScore}"
              data-match-id="${match.id}"
            />
          </form>
        </div>
        <div class="numbers">
          <h2 class="lws-singleResult">${match.totalScore}</h2>
        </div>
      </div>
    `;

    // Add an event listener to the delete button for each match
    document.querySelectorAll(".lws-delete").forEach((button) => {
      button.addEventListener("click", (event) => {
        const matchId = event.target.closest(".match").dataset.matchId;

        store.dispatch({ type: "DELETE_MATCH", payload: matchId });
      });
    });

    // Add an event listener to each increment and decrement form to listen for submit events
    document
      .querySelectorAll(".incrementForm, .decrementForm")
      .forEach((form) => {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const matchId = event.target.querySelector("input").dataset.matchId;
          const incrementScore = parseInt(
            event.target.parentNode.querySelector(
              `.lws-increment[data-match-id="${matchId}"]`
            ).value
          );
          const decrementScore = parseInt(
            event.target.parentNode.querySelector(
              `.lws-decrement[data-match-id="${matchId}"]`
            ).value
          );
          store.dispatch({
            type: "UPDATE_SCORES",
            payload: { matchId, incrementScore, decrementScore },
          });
        });
      });
  });

  // Sum all the total scores and display the result
  const totalScore = store
    .getState()
    .matches.reduce(
      (accumulator, currentMatch) => accumulator + currentMatch.totalScore,
      0
    );
  result.innerHTML = `Total: ${totalScore}`;
}

// Call render() once to display the initial state
render();

// Subscribe the render function to the store so that it gets called every time the state changes
store.subscribe(render);

addMatch.addEventListener("click", function () {
  store.dispatch({ type: "ADD_MATCH" });
});

resetMatches.addEventListener("click", function () {
  store.dispatch({ type: "RESET_MATCH" });
});
