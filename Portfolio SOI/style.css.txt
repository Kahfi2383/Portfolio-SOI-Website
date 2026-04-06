let data = [];
let filteredData = [];

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    filteredData = data;
    render();
  });

function render() {
  const container = document.getElementById("portfolioContainer");
  container.innerHTML = "";

  filteredData.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <h3>${item.company}</h3>
        <p><strong>${item.category}</strong></p>
        <p>${item.description}</p>
        <p><small>${item.year}</small></p>
      </div>
    `;
  });
}

function filterCategory(category) {
  if (category === "all") {
    filteredData = data;
  } else {
    filteredData = data.filter(d => d.category === category);
  }
  render();
}

function filterISO() {
  const iso = document.getElementById("isoFilter").value;
  if (!iso) {
    filteredData = data;
  } else {
    filteredData = data.filter(d => d.iso === iso);
  }
  render();
}

function searchPortfolio() {
  const keyword = document.getElementById("search").value.toLowerCase();
  filteredData = data.filter(d =>
    d.company.toLowerCase().includes(keyword)
  );
  render();
}
