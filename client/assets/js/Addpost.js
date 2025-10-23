// Global variables
let map;
let locationMarker;
let selectedLocation = null;
let uploadedMedia = [];

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeMediaUpload();
    initializeLocationDetection();
    initializeFormSubmission();
    checkAuthentication();
});

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to create a post');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Get auth headers
function getAuthHeaders(expectJson = true) {
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    if (expectJson) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

// Map initialization (unchanged)
function initializeMap() {
    map = L.map('locationMap').setView([40.7128, -74.0060], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    map.on('click', function(e) {
        setPostLocation(e.latlng);
    });

    console.log('Map initialized successfully');
}

// Set post location on map (unchanged)
function setPostLocation(latlng) {
    selectedLocation = latlng;
    
    if (locationMarker) {
        map.removeLayer(locationMarker);
    }
    
    locationMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #00e0ff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,224,255,0.8);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    document.getElementById('latitude').value = latlng.lat.toFixed(6);
    document.getElementById('longitude').value = latlng.lng.toFixed(6);
    
    getAddressFromCoordinates(latlng.lat, latlng.lng);
    
    locationMarker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <strong style="color: #00e0ff;">📍 Selected Location</strong><br>
            <span style="color: #666; font-size: 12px;">
                Lat: ${latlng.lat.toFixed(6)}<br>
                Lng: ${latlng.lng.toFixed(6)}
            </span>
        </div>
    `).openPopup();
    
    map.setView(latlng, 15);
}

// Get address from coordinates (unchanged)
function getAddressFromCoordinates(lat, lng) {
    const addressElement = document.getElementById('locationAddress');
    addressElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting address...';
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                const address = data.display_name;
                const shortenedAddress = address.length > 80 ? 
                    address.substring(0, 80) + '...' : address;
                addressElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${shortenedAddress}`;
            } else {
                addressElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Address not found';
            }
        })
        .catch(error => {
            console.error('Error getting address:', error);
            addressElement.innerHTML = `<i class="fas fa-map-pin"></i> Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        });
}

// Location detection (unchanged)
function initializeLocationDetection() {
    const locationBtn = document.getElementById('detectLocation');
    const mapOverlay = document.getElementById('mapOverlay');
    const accuracyIndicator = document.getElementById('accuracyIndicator');
    
    locationBtn.addEventListener('click', function() {
        const originalText = locationBtn.innerHTML;
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        locationBtn.disabled = true;
        mapOverlay.classList.add('active');
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latlng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    if (position.coords.accuracy < 50) {
                        accuracyIndicator.classList.remove('hidden');
                    }
                    
                    setPostLocation(latlng);
                    
                    mapOverlay.classList.remove('active');
                    locationBtn.innerHTML = '<i class="fas fa-check"></i> Location Found!';
                    
                    setTimeout(() => {
                        locationBtn.innerHTML = originalText;
                        locationBtn.disabled = false;
                    }, 2000);
                },
                function(error) {
                    console.error('Error getting location:', error);
                    
                    mapOverlay.classList.remove('active');
                    locationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
                    
                    setTimeout(() => {
                        locationBtn.innerHTML = originalText;
                        locationBtn.disabled = false;
                        alert('Unable to get your location. Please click on the map to select a location.');
                    }, 1500);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        } else {
            mapOverlay.classList.remove('active');
            locationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Not Supported';
            
            setTimeout(() => {
                locationBtn.innerHTML = originalText;
                locationBtn.disabled = false;
                alert('Geolocation is not supported by your browser.');
            }, 1500);
        }
    });
}

// Media upload functionality (unchanged)
function initializeMediaUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const mediaInput = document.getElementById('mediaInput');
    const browseBtn = document.getElementById('browseBtn');
    const mediaPreview = document.getElementById('mediaPreview');

    browseBtn.addEventListener('click', () => {
        console.log('Browse button clicked');
        mediaInput.click();
    });

    mediaInput.addEventListener('change', handleFileSelect);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('dragover');
    }

    function unhighlight() {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        console.log('Files dropped:', files.length);
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        console.log('Files selected:', files.length);
        handleFiles(files);
    }

    function handleFiles(files) {
        [...files].forEach(file => {
            if (validateFile(file)) {
                previewFile(file);
            }
        });
    }

    function validateFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB (matches backend)

        if (!validTypes.includes(file.type)) {
            alert('Please select valid image files (JPG, PNG, GIF)');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return false;
        }

        return true;
    }

    function previewFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            
            if (file.type.startsWith('image/')) {
                mediaItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-btn" onclick="removeMedia(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            mediaPreview.appendChild(mediaItem);
            uploadedMedia.push({
                file: file,
                element: mediaItem,
                previewUrl: e.target.result
            });
            
            console.log('Media preview added, total:', uploadedMedia.length);
        }
        
        reader.readAsDataURL(file);
    }
}

// Remove media function (unchanged)
function removeMedia(button) {
    const mediaItem = button.parentElement;
    const index = uploadedMedia.findIndex(item => item.element === mediaItem);
    
    if (index > -1) {
        uploadedMedia.splice(index, 1);
    }
    mediaItem.remove();
    
    console.log('Media removed, remaining:', uploadedMedia.length);
}

// Form submission - UPDATED FOR BACKEND INTEGRATION
function initializeFormSubmission() {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!checkAuthentication()) {
            return;
        }
        
        if (!validateForm()) {
            return;
        }

        loadingOverlay.classList.remove('hidden');

        try {
            const hasMedia = uploadedMedia.length > 0;

            let requestBody;
            let headers;

            if (hasMedia) {
                const formData = new FormData();
                formData.append('title', document.getElementById('postTitle').value.trim());
                formData.append('content', document.getElementById('postContent').value.trim());

                const rawTags = document.getElementById('postTags').value.trim();
                if (rawTags) {
                    formData.append('tags', rawTags);
                }

                if (selectedLocation) {
                    formData.append('latitude', selectedLocation.lat);
                    formData.append('longitude', selectedLocation.lng);
                }

                formData.append('image', uploadedMedia[0].file);

                console.log('Submitting post with form data');
                for (const pair of formData.entries()) {
                    console.log('FormData entry:', pair[0], pair[1]);
                }

                requestBody = formData;
                headers = getAuthHeaders(false);
            } else {
                const postPayload = {
                    title: document.getElementById('postTitle').value.trim(),
                    content: document.getElementById('postContent').value.trim(),
                    tags: document.getElementById('postTags').value.trim(),
                    latitude: selectedLocation ? selectedLocation.lat : null,
                    longitude: selectedLocation ? selectedLocation.lng : null
                };

                console.log('Submitting post with JSON payload', postPayload);

                requestBody = JSON.stringify(postPayload);
                headers = getAuthHeaders(true);
            }

            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers,
                body: requestBody
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create post');
            }

            loadingOverlay.classList.add('hidden');
            showSuccessMessage(result.data);
            
        } catch (error) {
            console.error('Error creating post:', error);
            loadingOverlay.classList.add('hidden');
            showErrorMessage(error.message);
        }
    });

    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            resetForm();
        }
    });
}

// Form validation
function validateForm() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const category = document.getElementById('postCategory').value;

    if (!title) {
        alert('Please enter a post title');
        document.getElementById('postTitle').focus();
        return false;
    }

    if (!content) {
        alert('Please enter post content');
        document.getElementById('postContent').focus();
        return false;
    }

    if (!category) {
        alert('Please select a category');
        document.getElementById('postCategory').focus();
        return false;
    }

    if (!selectedLocation) {
        alert('Please select a location for your post');
        return false;
    }

    return true;
}

// Show success message - UPDATED
function showSuccessMessage(post) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 22, 34, 0.95);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        border: 2px solid #00e0ff;
        box-shadow: 0 20px 50px rgba(0, 224, 255, 0.3);
        z-index: 10000;
        backdrop-filter: blur(20px);
        min-width: 300px;
    `;
    
    successMsg.innerHTML = `
        <div style="font-size: 4rem; color: #00e0ff; margin-bottom: 20px;">
            <i class="fas fa-check-circle"></i>
        </div>
        <h3 style="color: white; margin-bottom: 15px; font-size: 1.5rem;">Post Published!</h3>
        <p style="color: #B0C4DE; margin-bottom: 25px;">Your post "${post.title}" has been shared successfully.</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button onclick="this.parentElement.parentElement.remove(); resetForm();" 
                    style="background: #00e0ff; color: #0D1B2A; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-plus"></i> Create Another
            </button>
            <button onclick="window.location.href = 'index.html'" 
                    style="background: transparent; color: #00e0ff; border: 2px solid #00e0ff; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-eye"></i> View Posts
            </button>
        </div>
    `;
    
    document.body.appendChild(successMsg);
}

// Show error message
function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 22, 34, 0.95);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        border: 2px solid #FF6B6B;
        box-shadow: 0 20px 50px rgba(255, 107, 107, 0.3);
        z-index: 10000;
        backdrop-filter: blur(20px);
        min-width: 300px;
    `;
    
    errorMsg.innerHTML = `
        <div style="font-size: 4rem; color: #FF6B6B; margin-bottom: 20px;">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="color: white; margin-bottom: 15px; font-size: 1.5rem;">Error</h3>
        <p style="color: #B0C4DE; margin-bottom: 25px;">${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #FF6B6B; color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-times"></i> Close
        </button>
    `;
    
    document.body.appendChild(errorMsg);
}

// Reset form (unchanged)
function resetForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postPrivacy').value = 'public';
    document.getElementById('postTags').value = '';
    
    document.getElementById('mediaPreview').innerHTML = '';
    uploadedMedia = [];
    
    if (locationMarker) {
        map.removeLayer(locationMarker);
        locationMarker = null;
    }
    selectedLocation = null;
    document.getElementById('locationAddress').innerHTML = 'Click on the map or use location detection to set your post location';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('accuracyIndicator').classList.add('hidden');
    
    map.setView([40.7128, -74.0060], 13);
    
    console.log('Form reset successfully');
}