function addPost() {
  const desc = document.getElementById("post-desc").value;
  const mediaInput = document.getElementById("post-media");
  const postsContainer = document.getElementById("posts-container");

  if (!desc && mediaInput.files.length === 0) {
    alert("Please add a description or media.");
    return;
  }

  const post = document.createElement("div");
  post.classList.add("post");

  // Media
  if (mediaInput.files.length > 0) {
    const file = mediaInput.files[0];
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image")) {
      const img = document.createElement("img");
      img.src = url;
      post.appendChild(img);
    } else if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      post.appendChild(video);
    }
  }

  // Description
  if (desc) {
    const description = document.createElement("div");
    description.classList.add("description");
    description.textContent = desc;
    post.appendChild(description);
  }

  postsContainer.prepend(post); // newest post on top

  // Reset form
  document.getElementById("post-desc").value = "";
  mediaInput.value = "";
}
