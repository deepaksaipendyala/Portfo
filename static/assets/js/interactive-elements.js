// static/js/interactive-elements.js

// --------------- 1) Skills Graph (D3) ---------------

import * as d3 from 'd3';

// Create a bar chart of skills
export function createSkillsGraph(containerId) {
  const skills = [
    { name: "Python", level: 95, type: "Programming" },
    { name: "Machine Learning", level: 90, type: "AI" },
    { name: "Deep Learning", level: 85, type: "AI" },
    { name: "AWS", level: 80, type: "Cloud" },
    { name: "React", level: 75, type: "Frontend" },
    { name: "Flask", level: 85, type: "Backend" },
    { name: "Data Science", level: 90, type: "Analytics" },
    { name: "Computer Vision", level: 85, type: "AI" },
    { name: "MLOps", level: 80, type: "DevOps" },
    { name: "SQL", level: 85, type: "Database" }
  ];

  const margin = { top: 30, right: 20, bottom: 50, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove();

  // Create SVG
  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(skills.map(d => d.name))
    .range([0, height])
    .padding(0.2);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Proficiency Level (%)");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Color scale
  const colorScale = d3.scaleOrdinal()
    .domain(["Programming", "AI", "Cloud", "Frontend", "Backend", "Analytics", "DevOps", "Database"])
    .range(["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#9C27B0", "#FF6D00", "#00BCD4", "#3F51B5"]);

  // Create bars
  svg.selectAll(".bar")
    .data(skills)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => yScale(d.name))
    .attr("height", yScale.bandwidth())
    .attr("x", 0)
    .attr("width", 0)
    .attr("fill", d => colorScale(d.type))
    .attr("rx", 5)
    .attr("ry", 5);

  // Add tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
    .style("pointer-events", "none");

  // Animate bars
  svg.selectAll(".bar")
    .transition()
    .duration(1000)
    .attr("width", d => xScale(d.level))
    .delay((d, i) => i * 100);

  // Add hover effects
  svg.selectAll(".bar")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 0.8)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      
      tooltip.html(`
        <strong>${d.name}</strong><br>
        Type: ${d.type}<br>
        Level: ${d.level}%
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .attr("stroke", "none");
      
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add labels
  svg.selectAll(".label")
    .data(skills)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2)
    .attr("x", d => xScale(d.level) + 5)
    .attr("dy", ".35em")
    .attr("opacity", 0)
    .text(d => `${d.level}%`)
    .transition()
    .delay((d, i) => 1000 + i * 100)
    .duration(500)
    .attr("opacity", 1);

  // Create legend
  const types = Array.from(new Set(skills.map(d => d.type)));
  const legendSpacing = 20;
  const legendRectSize = 15;
  
  const legend = svg.selectAll(".legend")
    .data(types)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * (legendRectSize + legendSpacing) - 20})`);

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", d => colorScale(d));

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", legendRectSize / 2)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
}

// --------------- 2) Timeline (Vanilla JS + IntersectionObserver) ---------------

export function createTimeline(containerId) {
  const timelineData = [
    { year: "2023", event: "Research Assistant at NC State University", description: "Working on DARPA-funded 3D printing project" },
    { year: "2022", event: "Applied Scientist Intern at Amazon", description: "Developed Generative AI Finance Tool" },
    { year: "2022", event: "Recognized as Top 10 DeepLearning.AI Ambassador", description: "Featured in official blogs and social media" },
    { year: "2021", event: "Started Master's in Computer Science", description: "Focusing on Data Science and AI at NC State" },
    { year: "2020", event: "Intel IoT Student Ambassador", description: "Led technical community of 1000+ members" }
  ];

  const container = document.getElementById(containerId);
  
  // Create timeline HTML
  const timelineHtml = `
    <div class="timeline-container">
      ${timelineData.map((item, index) => `
        <div class="timeline-item" data-index="${index}">
          <div class="timeline-dot"></div>
          <div class="timeline-date">${item.year}</div>
          <div class="timeline-content">
            <h3>${item.event}</h3>
            <p>${item.description}</p>
          </div>
        </div>
      `).join('')}
      <div class="timeline-line"></div>
    </div>
  `;
  
  container.innerHTML = timelineHtml;
  
  // Add animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
  });
}

// --------------- 3) 3D Experience Visualization (THREE.js) ---------------

import * as THREE from 'three';

export function initExperienceVisualization(containerId) {
  const container = document.getElementById(containerId);
  const width = container.clientWidth;
  const height = container.clientHeight || 400;
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 30;
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  
  // Create a group to hold all objects
  const group = new THREE.Group();
  scene.add(group);
  
  // Create nodes for different experiences
  const experiences = [
    { name: "NC State Research", size: 5, color: 0x4285F4 },
    { name: "Amazon", size: 4.5, color: 0xFF9900 },
    { name: "DeepLearning.AI", size: 3.5, color: 0x00A0D1 },
    { name: "Intel IoT", size: 3, color: 0x0071C5 },
    { name: "AI Projects", size: 4, color: 0xEA4335 },
    { name: "ML Publications", size: 3.8, color: 0x34A853 }
  ];
  
  const nodes = [];
  experiences.forEach((exp, i) => {
    const geometry = new THREE.SphereGeometry(exp.size, 32, 32);
    const material = new THREE.MeshLambertMaterial({
      color: exp.color,
      transparent: true,
      opacity: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position spheres in a circle
    const angle = (i / experiences.length) * Math.PI * 2;
    const radius = 15;
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.y = Math.sin(angle) * radius;
    mesh.position.z = 0;

    // Add each sphere (node) to the group
    group.add(mesh);
    nodes.push(mesh);

    // Optionally add text labels:
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 256;
    textCanvas.height = 128;
    
    ctx.font = 'Bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(exp.name, 128, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(10, 5, 1);
    textSprite.position.set(
      mesh.position.x, 
      mesh.position.y - exp.size - 2, 
      mesh.position.z
    );
    group.add(textSprite);
  });
  
  // Add connections (lines) between each node
  experiences.forEach((_, i) => {
    for (let j = i + 1; j < experiences.length; j++) {
      const material = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.6
      });
      const points = [ nodes[i].position, nodes[j].position ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }
  });
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 20);
  scene.add(directionalLight);
  
  // Animation loop
  let rotateSpeed = 0.001;
  let mouseX = 0;
  let mouseDown = false;
  
  function animate() {
    requestAnimationFrame(animate);
    if (!mouseDown) {
      group.rotation.y += rotateSpeed;
    }
    renderer.render(scene, camera);
  }
  
  // Mouse interaction
  container.addEventListener('mousedown', (event) => {
    mouseDown = true;
    mouseX = event.clientX;
  });
  
  container.addEventListener('mouseup', () => {
    mouseDown = false;
  });
  
  container.addEventListener('mousemove', (event) => {
    if (mouseDown) {
      const deltaX = event.clientX - mouseX;
      group.rotation.y += deltaX * 0.005;
      mouseX = event.clientX;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight || 400;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
  
  // Kick off the animation
  animate();
}

// --------------- 4) Initialize All at Once ---------------

// Some simple styles for timeline
const timelineStyles = `
.timeline-container {
  position: relative;
  padding: 40px 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #3498db;
  transform: translateX(-50%);
}
.timeline-item {
  position: relative;
  display: flex;
  margin-bottom: 50px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}
.timeline-item.animate {
  opacity: 1;
  transform: translateY(0);
}
.timeline-item:nth-child(odd) {
  flex-direction: row-reverse;
}
.timeline-dot {
  position: absolute;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  transition: background 0.3s ease;
}
.timeline-item:hover .timeline-dot {
  background: #2980b9;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
}
.timeline-date {
  width: 20%;
  font-weight: bold;
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
}
.timeline-content {
  width: 40%;
  padding: 20px;
  background: white;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}
.timeline-content:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.timeline-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.3em;
}
.timeline-content p {
  margin-bottom: 0;
  color: #666;
}
@media (max-width: 768px) {
  .timeline-line {
    left: 30px;
  }
  .timeline-item {
    flex-direction: row !important;
    margin-left: 30px;
  }
  .timeline-dot {
    left: 30px;
  }
  .timeline-date {
    position: absolute;
    left: 80px;
    top: -25px;
    width: auto;
  }
  .timeline-content {
    width: calc(100% - 80px);
    margin-left: 80px;
  }
}
`;

// Function to inject timeline styles & run all initialization
export function initializePortfolioInteractions() {
  // Add timeline styles
  const styleElement = document.createElement('style');
  styleElement.textContent = timelineStyles;
  document.head.appendChild(styleElement);

  // Skills graph
  const skillsContainer = document.getElementById('skills-graph-container');
  if (skillsContainer) {
    createSkillsGraph('skills-graph-container');
  }

  // Timeline
  const timelineContainer = document.getElementById('timeline-container');
  if (timelineContainer) {
    createTimeline('timeline-container');
  }

  // 3D Visualization
  const experienceContainer = document.getElementById('experience-3d-container');
  if (experienceContainer) {
    initExperienceVisualization('experience-3d-container');
  }
}
