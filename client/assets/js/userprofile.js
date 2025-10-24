const API_BASE_URL = 'http://localhost:5000/api/v1/profile';

const defaultProfile = {
    firstName: 'Investor',
    surname: 'Connect',
    age: 30,
    dob: '1995-01-01',
    email: 'investor@connect.com',
    phone: '555-INVEST',
    bio: 'Add something about yourself...',
    profilePicture: 'https://via.placeholder.com/160/00e0ff/0D1B2A?text=IC'
};

const getToken = () => localStorage.getItem('token');

function showMessage(text, variant = 'error') {
    const el = document.getElementById('profileMessage'); // You might need to add this element to your HTML
    if (!el) return;
    el.textContent = text;
    el.style.color = variant === 'success' ? '#00e0ff' : '#ff6b6b';
    el.style.display = 'block';
}

function renderProfile(profile) {
    const fullName = `${profile.firstName || ''} ${profile.surname || ''}`.trim();
    document.getElementById('profileName').textContent = fullName || 'Investor Connect';
    document.getElementById('profileBio').textContent = `Bio: ${profile.bio || defaultProfile.bio}`;
    document.getElementById('profileAge').textContent = `Age: ${profile.age || '--'}`;
    document.getElementById('profileDob').textContent = `DOB: ${profile.dob ? new Date(profile.dob).toLocaleDateString() : '--'}`;
    
    // User might be populated from the backend
    const email = profile.user ? profile.user.email : (profile.email || '--');
    document.getElementById('profileEmail').textContent = `Email: ${email}`;
    document.getElementById('profilePhone').textContent = `Phone: ${profile.phone || '--'}`;

    const photo = document.getElementById('profilePhoto');
    if (profile.profilePicture) {
        photo.src = profile.profilePicture.startsWith('http') ? profile.profilePicture : `http://localhost:5000${profile.profilePicture}`;
    } else {
        photo.src = defaultProfile.profilePicture;
    }
    photo.alt = `${fullName}'s profile picture`;

    // These can be updated if you fetch posts/videos from backend
    const postsContainer = document.getElementById('postsContainer');
    const videosContainer = document.getElementById('videosContainer');
    document.getElementById('postCount').textContent = postsContainer.children.length;
    document.getElementById('videoCount').textContent = videosContainer.children.length;
}


async function fetchAndRenderProfile() {
    const token = getToken();
    if (!token) {
        showMessage('You are not logged in. Displaying default profile.');
        renderProfile(defaultProfile);
        // Optional: Redirect to login after a delay
        setTimeout(() => {
            // window.location.href = 'login.html';
        }, 3000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            showMessage('No profile found. Please create one!');
            renderProfile(defaultProfile); // Render default and prompt to create
            document.getElementById('editProfileBtn').textContent = "Create Profile";
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load profile. Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
            renderProfile(result.data);
        } else {
            throw new Error(result.message || 'Could not parse profile data.');
        }

    } catch (error) {
        console.error('Failed to fetch profile:', error);
        showMessage(error.message);
        renderProfile(defaultProfile); // Fallback to default on error
    }
}


// Populate post/video grids with placeholder cards
const postsContainer = document.getElementById('postsContainer');
const videosContainer = document.getElementById('videosContainer');

function buildPlaceholderCards() {
    postsContainer.innerHTML = '';
    videosContainer.innerHTML = '';

    for (let i = 1; i <= 6; i++) {
        const card = document.createElement('div');
        card.className = 'post';
        card.innerHTML = `<span class="card-label">Post</span><strong>Coming soon ${i}</strong>`;
        postsContainer.appendChild(card);
    }

    for (let i = 1; i <= 3; i++) {
        const card = document.createElement('div');
        card.className = 'post video';
        card.innerHTML = `<span class="card-label">Video</span><strong>Showcase ${i}</strong>`;
        videosContainer.appendChild(card);
    }
}

// Tab switching between posts and videos
const tabButtons = document.querySelectorAll('.tab-button');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-grid').forEach(grid => grid.classList.add('hidden'));

        button.classList.add('active');
        const target = button.dataset.content;
        document.getElementById(`${target}Container`).classList.remove('hidden');
    });
});

// Route to edit profile page
const editProfileBtn = document.getElementById('editProfileBtn');
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        window.location.href = 'editprofile.html';
    });
}

// Initial setup
function init() {
    buildPlaceholderCards();
    fetchAndRenderProfile();
}

init();
