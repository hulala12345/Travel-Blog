async function loadData() {
  const postRes = await fetch('data/posts.json');
  const posts = await postRes.json();
  const foodRes = await fetch('data/food.json');
  const foods = await foodRes.json();
  return { posts, foods };
}

function renderPosts(posts) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <img src="${post.coverImage}" alt="${post.title}">
      <div class="post-content">
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
        <button onclick="showGallery(${post.id})">View Photos</button>
      </div>
    `;
    postsContainer.appendChild(div);
  });
}

function renderMap(posts) {
  const map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  posts.forEach(post => {
    const marker = L.marker([post.location.lat, post.location.lng]).addTo(map);
    marker.bindPopup(`<b>${post.title}</b><br>${post.location.name}`);
  });
}

function renderFood(foods) {
  const container = document.getElementById('food-list');
  container.innerHTML = '';
  foods.forEach(item => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h4>${item.name}</h4>
      <p>${item.description}</p>
      <small>${item.location}</small>
    `;
    container.appendChild(div);
  });
}

function renderTimeline(posts) {
  const container = document.getElementById('timeline');
  container.innerHTML = '';
  const sorted = posts.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach(post => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.textContent = `${post.date} - ${post.title}`;
    container.appendChild(div);
  });
}

function populateTags(posts) {
  const select = document.getElementById('tag-filter');
  const tags = Array.from(new Set(posts.flatMap(p => p.tags)));
  select.innerHTML = '<option value="all">All Locations</option>';
  tags.forEach(tag => {
    const opt = document.createElement('option');
    opt.value = tag;
    opt.textContent = tag;
    select.appendChild(opt);
  });
}

function filterPosts(allPosts) {
  const value = document.getElementById('tag-filter').value;
  if (value === 'all') return allPosts;
  return allPosts.filter(post => post.tags.includes(value));
}

let globalData;

document.addEventListener('DOMContentLoaded', async () => {
  globalData = await loadData();
  populateTags(globalData.posts);
  updateView();
  document.getElementById('tag-filter').addEventListener('change', updateView);
});

function updateView() {
  const posts = filterPosts(globalData.posts);
  renderPosts(posts);
  renderMap(posts);
  renderFood(globalData.foods);
  renderTimeline(posts);
}

function showGallery(postId) {
  const post = globalData.posts.find(p => p.id === postId);
  const modal = document.getElementById('gallery-modal');
  modal.innerHTML = '';
  post.photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    modal.appendChild(img);
  });
  modal.style.display = 'flex';
  modal.onclick = () => {
    modal.style.display = 'none';
  };
}
