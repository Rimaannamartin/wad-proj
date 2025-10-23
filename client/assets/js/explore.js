// Explore Page JavaScript
class ExplorePage {
    constructor() {
        this.posts = [];
        this.currentPage = 1;
        this.hasMore = true;
        this.isLoading = false;
        this.filters = {
            search: '',
            location: '',
            category: '',
            tags: ''
        };
        this.currentPostId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPosts();
        this.checkAuthentication();
    }

    checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('User not authenticated. Some features may not work.');
        }
        return !!token;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    bindEvents() {
        // Search and filter events
        document.getElementById('applyFilters').addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMorePosts());
        
        // Modal events
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeLocationModal());
        }

        // Enter key support for search
        const postSearch = document.getElementById('postSearch');
        const locationSearch = document.getElementById('locationSearch');
        
        if (postSearch) {
            postSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.applyFilters();
            });
        }
        
        if (locationSearch) {
            locationSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.applyFilters();
            });
        }

        // Close modal on backdrop click
        const locationModal = document.getElementById('locationModal');
        if (locationModal) {
            locationModal.addEventListener('click', (e) => {
                if (e.target.id === 'locationModal') this.closeLocationModal();
            });
        }

        // Meeting request form
        const meetingForm = document.getElementById('meetingForm');
        if (meetingForm) {
            meetingForm.addEventListener('submit', (e) => this.submitMeetingRequest(e));
        }

        // Comments
        const submitCommentBtn = document.getElementById('submitComment');
        if (submitCommentBtn) {
            submitCommentBtn.addEventListener('click', () => this.submitComment());
        }
    }

    async loadPosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        try {
            // Build query parameters
            const params = {
                page: this.currentPage,
                limit: 9
            };

            // Add filters if they have values
            if (this.filters.search) params.search = this.filters.search;
            if (this.filters.location) params.location = this.filters.location;
            if (this.filters.category) params.category = this.filters.category;
            if (this.filters.tags) params.tags = this.filters.tags;

            const queryParams = new URLSearchParams(params);
            const response = await fetch(`http://localhost:5000/api/v1/posts?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                if (this.currentPage === 1) {
                    this.posts = result.data || [];
                } else {
                    this.posts = [...this.posts, ...(result.data || [])];
                }
                
                // Handle pagination - adjust based on your API response structure
                this.hasMore = result.data && result.data.length > 0;
                if (result.pagination) {
                    this.hasMore = this.currentPage < result.pagination.total;
                }
                
                this.renderPosts();
                this.updateLoadMoreButton();
            } else {
                throw new Error(result.message || 'Failed to load posts');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts. Please try again.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async loadMorePosts() {
        this.currentPage++;
        await this.loadPosts();
    }

    applyFilters() {
        this.filters = {
            search: document.getElementById('postSearch')?.value.trim() || '',
            location: document.getElementById('locationSearch')?.value.trim() || '',
            category: document.getElementById('categoryFilter')?.value || '',
            tags: ''
        };
        
        this.currentPage = 1;
        this.hasMore = true;
        this.loadPosts();
    }

    clearFilters() {
        if (document.getElementById('postSearch')) document.getElementById('postSearch').value = '';
        if (document.getElementById('locationSearch')) document.getElementById('locationSearch').value = '';
        if (document.getElementById('categoryFilter')) document.getElementById('categoryFilter').value = '';
        
        this.filters = {
            search: '',
            location: '',
            category: '',
            tags: ''
        };
        
        this.currentPage = 1;
        this.hasMore = true;
        this.loadPosts();
    }

    renderPosts() {
        const container = document.getElementById('postsContainer');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;

        if (this.currentPage === 1) {
            container.innerHTML = '';
        }

        if (this.posts.length === 0 && this.currentPage === 1) {
            if (noResults) noResults.classList.remove('hidden');
            container.innerHTML = '';
            return;
        } else {
            if (noResults) noResults.classList.add('hidden');
        }

        this.posts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        
        // Safely handle post data
        const title = post.title || 'Untitled';
        const content = post.content || '';
        const imageUrl = post.imageUrl ? `http://localhost:5000${post.imageUrl}` : '';
        const tags = post.tags || [];
        const author = post.author || {};
        const likes = post.likes || [];
        const likeCount = post.likeCount || post.likes?.length || 0;
        const commentCount = post.commentCount || post.comments?.length || 0;
        const location = post.location || null;
        
        postDiv.innerHTML = `
            ${imageUrl ? `
                <div class="post-media">
                    <img src="${imageUrl}" alt="${this.escapeHtml(title)}" onerror="this.style.display='none'">
                </div>
            ` : ''}
            
            <div class="post-content">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(title)}</h3>
                    <div class="post-actions">
                        <button class="action-btn like-btn ${likes.includes(this.getCurrentUserId()) ? 'liked' : ''}" 
                                onclick="explorePage.likePost('${post._id}')">
                            <i class="fas fa-heart"></i>
                            <span>${likeCount}</span>
                        </button>
                        
                        <button class="action-btn comment-btn" onclick="explorePage.showComments('${post._id}')">
                            <i class="fas fa-comment"></i>
                            <span>${commentCount}</span>
                        </button>
                        
                        <button class="action-btn meeting-btn" onclick="explorePage.requestMeeting('${post._id}')">
                            <i class="fas fa-calendar-check"></i>
                            <span>Meet</span>
                        </button>
                    </div>
                </div>
                
                <p class="post-description">${this.escapeHtml(content)}</p>
                
                ${tags.length > 0 ? `
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="post-tag">#${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="post-meta">
                    <div class="post-author">
                        <div class="author-avatar">
                            ${author.name ? author.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        ${author.name ? this.escapeHtml(author.name) : 'Unknown User'}
                    </div>
                    <div class="post-date">
                        ${this.formatDate(post.createdAt)}
                    </div>
                </div>
                
                ${location ? `
                    <div class="post-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.formatLocation(location)}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        return postDiv;
    }

    async likePost(postId) {
        if (!this.checkAuthentication()) {
            alert('Please login to like posts');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/posts/${postId}/like`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update the like count visually
                const likeBtns = document.querySelectorAll(`.like-btn[onclick="explorePage.likePost('${postId}')"]`);
                likeBtns.forEach(likeBtn => {
                    likeBtn.classList.toggle('liked');
                    const likeCount = result.data.likeCount || 0;
                    likeBtn.innerHTML = `<i class="fas fa-heart"></i><span>${likeCount}</span>`;
                });
                
                // Show success message
                this.showSuccess('Post liked!');
            } else {
                throw new Error(result.message || 'Failed to like post');
            }
        } catch (error) {
            console.error('Error liking post:', error);
            this.showError('Failed to like post. Please try again.');
        }
    }

    async requestMeeting(postId) {
        if (!this.checkAuthentication()) {
            alert('Please login to request meetings');
            return;
        }

        this.currentPostId = postId;
        this.showMeetingModal();
    }

    showMeetingModal() {
        const modal = document.getElementById('meetingModal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            // Fallback if modal doesn't exist
            alert('Meeting request feature would open here');
        }
    }

    closeMeetingModal() {
        const modal = document.getElementById('meetingModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        const meetingForm = document.getElementById('meetingForm');
        if (meetingForm) {
            meetingForm.reset();
        }
        this.currentPostId = null;
    }

    async submitMeetingRequest(e) {
        if (e) e.preventDefault();
        
        if (!this.currentPostId) {
            this.showError('No post selected for meeting');
            return;
        }

        const date = document.getElementById('meetingDate')?.value;
        const time = document.getElementById('meetingTime')?.value;
        const message = document.getElementById('meetingMessage')?.value;

        if (!date || !time || !message) {
            this.showError('Please fill all meeting details');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/posts/${this.currentPostId}/meeting`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ date, time, message })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccess('Meeting request sent successfully!');
                this.closeMeetingModal();
                
                // Reset form
                if (document.getElementById('meetingForm')) {
                    document.getElementById('meetingForm').reset();
                }
            } else {
                throw new Error(result.message || 'Failed to send meeting request');
            }
        } catch (error) {
            console.error('Error sending meeting request:', error);
            this.showError('Failed to send meeting request. Please try again.');
        }
    }

    async showComments(postId) {
        if (!this.checkAuthentication()) {
            alert('Please login to view comments');
            return;
        }

        try {
            this.currentPostId = postId;
            const response = await fetch(`http://localhost:5000/api/v1/posts/${postId}`);
            const result = await response.json();

            if (response.ok && result.success) {
                const commentInput = document.getElementById('commentText');
                if (commentInput) {
                    commentInput.value = '';
                }

                const commentCount = result.data.commentCount ?? (result.data.comments ? result.data.comments.length : 0);
                this.posts = this.posts.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: result.data.comments,
                            commentCount
                        };
                    }
                    return post;
                });
                this.updateCommentCountUI(postId, commentCount);
                this.displayComments(result.data);
            } else {
                throw new Error(result.message || 'Failed to load comments');
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showError('Failed to load comments. Please try again.');
        }
    }

    displayComments(post) {
        const modal = document.getElementById('commentsModal');
        const commentsList = document.getElementById('commentsList');
        
        if (modal && commentsList) {
            const comments = post.comments || [];
            commentsList.innerHTML = comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${this.getCommentAuthor(comment.user)}</span>
                        <span class="comment-time">${this.formatDate(comment.createdAt)}</span>
                    </div>
                    <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                </div>
            `).join('');
            
            modal.classList.remove('hidden');
        } else {
            // Fallback
            alert(`Comments for post: ${post.comments?.length || 0} comments`);
        }
    }

    closeCommentsModal() {
        const modal = document.getElementById('commentsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        const commentInput = document.getElementById('commentText');
        if (commentInput) {
            commentInput.value = '';
        }
        this.currentPostId = null;
    }

    async submitComment() {
        if (!this.checkAuthentication()) {
            alert('Please login to comment on posts');
            return;
        }

        const commentInput = document.getElementById('commentText');
        const content = commentInput?.value.trim();

        if (!content) {
            this.showError('Please enter a comment');
            return;
        }

        if (!this.currentPostId) {
            this.showError('No post selected for commenting');
            return;
        }

        const postId = this.currentPostId;

        try {
            const response = await fetch(`http://localhost:5000/api/v1/posts/${postId}/comments`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ content })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to add comment');
            }

            if (commentInput) {
                commentInput.value = '';
            }

            this.showSuccess('Comment added successfully');
            await this.showComments(postId);
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showError('Failed to add comment. Please try again.');
        }
    }

    showLocation(latitude, longitude) {
        const modal = document.getElementById('locationModal');
        const mapContainer = document.getElementById('locationMap');
        
        if (!modal || !mapContainer) return;

        // Clear previous map
        mapContainer.innerHTML = '';
        
        // Create new map
        const map = L.map('locationMap').setView([latitude, longitude], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Post Location')
            .openPopup();

        modal.classList.remove('hidden');
    }

    closeLocationModal() {
        const modal = document.getElementById('locationModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showLoading(show) {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            if (show) {
                loadingSection.classList.remove('hidden');
            } else {
                loadingSection.classList.add('hidden');
            }
        }
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // You can implement a better notification system
        console.log('Success:', message);
    }

    updateCommentCountUI(postId, count) {
        const commentBtns = document.querySelectorAll(`.comment-btn[onclick="explorePage.showComments('${postId}')"]`);
        commentBtns.forEach(btn => {
            btn.innerHTML = `<i class="fas fa-comment"></i><span>${count}</span>`;
        });
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            if (!this.hasMore || this.posts.length === 0) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
            }
        }
    }

    getCurrentUserId() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id || userData._id;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        return null;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    formatLocation(location) {
        if (typeof location === 'string') return location;
        if (location.address) return location.address;
        if (location.latitude && location.longitude) {
            return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        }
        return 'Location available';
    }

    getCommentAuthor(user) {
        if (!user) return 'Unknown User';
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        if (fullName) {
            return fullName;
        }
        return user.username || user.name || 'Unknown User';
    }
}

// Initialize explore page when DOM is loaded
let explorePage;
document.addEventListener('DOMContentLoaded', () => {
    explorePage = new ExplorePage();
});