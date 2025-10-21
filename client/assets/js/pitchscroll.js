async function loadPosts() {
  try {
    // 👉 Replace this with your backend API
    const res = await fetch("http://localhost:3000/posts");
    const posts = await res.json();

    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    posts.forEach(post => {
      const postEl = document.createElement("div");
      postEl.classList.add("post");

      // Media
      if (post.type === "image") {
        const img = document.createElement("img");
        img.src = post.mediaUrl;
        postEl.appendChild(img);
      } else if (post.type === "video") {
        const video = document.createElement("video");
        video.src = post.mediaUrl;
        video.controls = true;
        postEl.appendChild(video);
      }

      // Description
      if (post.description) {
        const desc = document.createElement("div");
        desc.classList.add("description");
        desc.textContent = post.description;
        postEl.appendChild(desc);
      }

      postsContainer.appendChild(postEl);
    });
  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

// Load posts on page load
document.addEventListener("DOMContentLoaded", loadPosts);
