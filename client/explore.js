// --- SEARCH FUNCTION ---
function searchStartups() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(input) ? 'block' : 'none';
  });
}

// --- SAVE / WATCHLIST FUNCTION ---
function saveStartup(title) {
  alert(`${title} has been saved to your watchlist!`);
}

// --- CONNECT FUNCTION ---
function connectStartup(title) {
  alert(`Connection request sent to ${title}'s founder.`);
}

// --- REQUEST PITCH DECK FUNCTION ---
function requestPitchDeck(title) {
  alert(`Pitch deck request sent to ${title}.`);
}

// --- DYNAMIC STARTUP ADD FUNCTION ---
function addStartup(title, description, mediaFile, isVideo = false) {
  const container = document.getElementById('cardsContainer');

  // Create card
  const card = document.createElement('div');
  card.classList.add('card');

  // Media
  const mediaDiv = document.createElement('div');
  mediaDiv.classList.add('media');

  if (isVideo) {
    const video = document.createElement('video');
    video.controls = true;
    video.innerHTML = `<source src="${mediaFile}" type="video/mp4">Your browser does not support video.`;
    mediaDiv.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = mediaFile;
    img.alt = title;
    mediaDiv.appendChild(img);
  }

  // Title
  const h3 = document.createElement('h3');
  h3.textContent = title;

  // Description
  const p = document.createElement('p');
  p.textContent = description;

  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('actions');

  const btnDeck = document.createElement('button');
  btnDeck.textContent = 'Request Pitch Deck';
  btnDeck.onclick = () => requestPitchDeck(title);

  const btnConnect = document.createElement('button');
  btnConnect.textContent = 'Connect';
  btnConnect.onclick = () => connectStartup(title);

  const btnSave = document.createElement('button');
  btnSave.textContent = 'Save';
  btnSave.onclick = () => saveStartup(title);

  actionsDiv.appendChild(btnDeck);
  actionsDiv.appendChild(btnConnect);
  actionsDiv.appendChild(btnSave);

  // Append all
  card.appendChild(mediaDiv);
  card.appendChild(h3);
  card.appendChild(p);
  card.appendChild(actionsDiv);

  container.appendChild(card);
}

// --- EXAMPLE: Dynamically adding a startup (remove or keep for demo) ---
/*
addStartup(
  "GreenEnergy Co.",
  "Sustainable energy solutions for urban housing.",
  "startup4.jpg",
  false
);
*/
