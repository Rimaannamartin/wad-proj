// Global variables
let map;
let locationMarker;
let selectedLocation = null;
let uploadedMedia = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeMediaUpload();
    initializeLocationDetection();
    initializeFormSubmission();
});

// Map initialization
function initializeMap() {
    // Create map with default view (New York)
    map = L.map('locationMap').setView([40.7128, -74.0060], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add click event to set location
    map.on('click', function(e) {
        setPostLocation(e.latlng);
    });

    console.log('Map initialized successfully');
}

// Set post location on map
function setPostLocation(latlng) {
    selectedLocation = latlng;
    
    // Remove existing marker
    if (locationMarker) {
        map.removeLayer(locationMarker);
    }
    
    // Add new marker
    locationMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #00e0ff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,224,255,0.8);"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    // Update coordinate inputs
    document.getElementById('latitude').value = latlng.lat.toFixed(6);
    document.getElementById('longitude').value = latlng.lng.toFixed(6);
    
    // Get address from coordinates
    getAddressFromCoordinates(latlng.lat, latlng.lng);
    
    // Add popup
    locationMarker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <strong style="color: #00e0ff;">📍 Selected Location</strong><br>
            <span style="color: #666; font-size: 12px;">
                Lat: ${latlng.lat.toFixed(6)}<br>
                Lng: ${latlng.lng.toFixed(6)}
            </span>
        </div>
    `).openPopup();
    
    // Zoom to location
    map.setView(latlng, 15);
}

// Get address from coordinates
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

// Location detection
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
                    
                    // Show accuracy indicator for high precision
                    if (position.coords.accuracy < 50) {
                        accuracyIndicator.classList.remove('hidden');
                    }
                    
                    setPostLocation(latlng);
                    
                    // Success state
                    mapOverlay.classList.remove('active');
                    locationBtn.innerHTML = '<i class="fas fa-check"></i> Location Found!';
                    
                    setTimeout(() => {
                        locationBtn.innerHTML = originalText;
                        locationBtn.disabled = false;
                    }, 2000);
                },
                function(error) {
                    console.error('Error getting location:', error);
                    
                    // Error state
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

// Media upload functionality
function initializeMediaUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const mediaInput = document.getElementById('mediaInput');
    const browseBtn = document.getElementById('browseBtn');
    const mediaPreview = document.getElementById('mediaPreview');

    // Browse button click
    browseBtn.addEventListener('click', () => {
        console.log('Browse button clicked');
        mediaInput.click();
    });

    // File input change
    mediaInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
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

    // Handle drop
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
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!validTypes.includes(file.type)) {
            alert('Please select valid image or video files (JPG, PNG, GIF, MP4, MOV)');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 50MB');
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
            } else if (file.type.startsWith('video/')) {
                mediaItem.innerHTML = `
                    <video controls>
                        <source src="${e.target.result}" type="${file.type}">
                    </video>
                    <button type="button" class="remove-btn" onclick="removeMedia(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            mediaPreview.appendChild(mediaItem);
            uploadedMedia.push({
                file: file,
                element: mediaItem
            });
            
            console.log('Media preview added, total:', uploadedMedia.length);
        }
        
        reader.readAsDataURL(file);
    }
}

// Remove media function (must be global for onclick to work)
function removeMedia(button) {
    const mediaItem = button.parentElement;
    const index = uploadedMedia.findIndex(item => item.element === mediaItem);
    
    if (index > -1) {
        uploadedMedia.splice(index, 1);
    }
    mediaItem.remove();
    
    console.log('Media removed, remaining:', uploadedMedia.length);
}

// Form submission
function initializeFormSubmission() {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading
        loadingOverlay.classList.remove('hidden');

        // Simulate API call
        setTimeout(() => {
            const postData = {
                title: document.getElementById('postTitle').value,
                content: document.getElementById('postContent').value,
                category: document.getElementById('postCategory').value,
                privacy: document.getElementById('postPrivacy').value,
                tags: document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                location: selectedLocation,
                mediaCount: uploadedMedia.length,
                media: uploadedMedia.map(item => ({
                    name: item.file.name,
                    type: item.file.type,
                    size: item.file.size
                }))
            };

            console.log('Post Data:', postData);
            
            // Hide loading
            loadingOverlay.classList.add('hidden');
            
            // Show success
            showSuccessMessage();
            
        }, 3000);
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

// Show success message
function showSuccessMessage() {
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
        <p style="color: #B0C4DE; margin-bottom: 25px;">Your post has been shared successfully.</p>
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

// Reset form
function resetForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postPrivacy').value = 'public';
    document.getElementById('postTags').value = '';
    
    // Clear media
    document.getElementById('mediaPreview').innerHTML = '';
    uploadedMedia = [];
    
    // Clear location
    if (locationMarker) {
        map.removeLayer(locationMarker);
        locationMarker = null;
    }
    selectedLocation = null;
    document.getElementById('locationAddress').innerHTML = 'Click on the map or use location detection to set your post location';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('accuracyIndicator').classList.add('hidden');
    
    // Reset map view
    map.setView([40.7128, -74.0060], 13);
    
    console.log('Form reset successfully');
}