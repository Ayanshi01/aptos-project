// Initialize Petra wallet adapter
let wallet = null;
let isWalletConnected = false;
let userAddress = null;

// AI Image Generation Configuration
const AI_CONFIG = {
    STABLE_DIFFUSION_URL: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
    API_KEY: "YOUR_HUGGING_FACE_API_KEY", // Replace with your API key
    MAX_STEPS: 50,
    GUIDANCE_SCALE: 7.5
};

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const projectForm = document.getElementById('project-form');
const projectsContainer = document.getElementById('projects-container');
const themeToggle = document.getElementById('theme-toggle');
const walletStatus = document.getElementById('wallet-status');
const walletModal = document.getElementById('wallet-modal');
const getStartedBtn = document.querySelector('.cta-btn.primary');

// Check if Petra wallet is installed
function checkPetraWallet() {
    if (typeof window.aptos !== 'undefined') {
        wallet = window.aptos;
        return true;
    }
    return false;
}

// Show/hide wallet modal
function showWalletModal() {
    walletModal.style.display = 'flex';
    walletModal.style.animation = 'fadeIn 0.3s ease';
}

function closeModal() {
    walletModal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        walletModal.style.display = 'none';
    }, 300);
}

// Enhanced theme handling with smooth transitions
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.checked = theme === 'dark';
    
    // Add theme transition animation
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
    document.body.style.color = theme === 'dark' ? '#ffffff' : '#333';
}

// Initialize theme with animation
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    setTheme(theme);
});

// Sample projects data (in a real app, this would come from a backend)
const sampleProjects = [
    {
        id: 1,
        name: "DeFi Dashboard",
        description: "A comprehensive dashboard for tracking DeFi metrics on Aptos",
        repo: "https://github.com/example/defi-dashboard",
        files: [],
        image: null
    },
    {
        id: 2,
        name: "NFT Marketplace",
        description: "A decentralized marketplace for trading NFTs on Aptos",
        repo: "https://github.com/example/nft-marketplace",
        files: [],
        image: null
    }
];

// Enhanced scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.animate__animated');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8 && elementBottom > 0) {
            element.classList.add('animate__fadeIn');
            
            // Add parallax effect to hero section
            if (element.classList.contains('hero')) {
                const scrolled = window.pageYOffset;
                element.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }
    });
}

// Enhanced wallet connection animation
async function connectWallet() {
    try {
        if (!checkPetraWallet()) {
            showWalletModal();
            return;
        }

        connectWalletBtn.classList.add('connecting');
        connectWalletBtn.disabled = true;
        
        // Add connecting animation
        connectWalletBtn.innerHTML = `
            <span class="btn-text">Connecting...</span>
            <span class="btn-icon">⚡</span>
        `;
        
        // Request account access
        const response = await wallet.connect();
        isWalletConnected = true;
        userAddress = response.address;
        
        // Success animation
        connectWalletBtn.innerHTML = `
            <span class="btn-text">Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}</span>
            <span class="btn-icon">✓</span>
        `;
        connectWalletBtn.style.backgroundColor = '#4CAF50';
        
        // Hide Get Started button
        if (getStartedBtn) {
            getStartedBtn.style.display = 'none';
        }
        
        // Show success message with enhanced animation
        showWalletStatus('Wallet connected successfully!', 'success');
        
        // Add ripple effect to project cards
        document.querySelectorAll('.project-card').forEach((card, index) => {
            card.style.animation = `slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`;
            card.style.transform = 'translateY(0)';
        });
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        showWalletStatus('Failed to connect wallet. Please try again.', 'error');
        connectWalletBtn.innerHTML = `
            <span class="btn-text">Connect Petra Wallet</span>
            <span class="btn-icon">👛</span>
        `;
    } finally {
        connectWalletBtn.classList.remove('connecting');
        connectWalletBtn.disabled = false;
    }
}

// Enhanced wallet status animation
function showWalletStatus(message, type) {
    walletStatus.textContent = message;
    walletStatus.className = `wallet-status show ${type}`;
    
    // Add pulse animation for success
    if (type === 'success') {
        walletStatus.style.animation = 'pulse 1s ease infinite';
    }
    
    setTimeout(() => {
        walletStatus.classList.remove('show');
        walletStatus.style.animation = '';
    }, 3000);
}

// GitHub file handling
async function handleGitHubFiles(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) {
        showWalletStatus('Project not found', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal github-files-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add GitHub Files</h2>
            <div class="github-files-form">
                <div class="form-group">
                    <label for="github-url">GitHub File URL</label>
                    <input type="url" id="github-url" placeholder="https://github.com/username/repo/blob/main/file.js" required>
                </div>
                <div class="form-group">
                    <label for="file-description">File Description</label>
                    <input type="text" id="file-description" placeholder="Brief description of the file">
                </div>
                <button class="add-file-btn" onclick="addGitHubFile(${projectId})">
                    <span class="btn-icon">➕</span>
                    Add File
                </button>
            </div>
            <div class="files-list">
                <h3>Added Files</h3>
                <div class="files-container">
                    ${project.files.map(file => `
                        <div class="file-item">
                            <span class="file-name">${file.name}</span>
                            <span class="file-description">${file.description}</span>
                            <button class="remove-file-btn" onclick="removeFile(${projectId}, '${file.url}')">
                                <span class="btn-icon">🗑️</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Add GitHub file
function addGitHubFile(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) return;

    const urlInput = document.getElementById('github-url');
    const descriptionInput = document.getElementById('file-description');
    
    if (!urlInput.value) {
        showWalletStatus('Please enter a GitHub file URL', 'error');
        return;
    }

    const fileName = urlInput.value.split('/').pop();
    project.files.push({
        name: fileName,
        url: urlInput.value,
        description: descriptionInput.value || 'No description provided'
    });

    // Update display
    handleGitHubFiles(projectId);
    showWalletStatus('File added successfully!', 'success');
}

// Remove file
function removeFile(projectId, fileUrl) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) return;

    project.files = project.files.filter(file => file.url !== fileUrl);
    handleGitHubFiles(projectId);
    showWalletStatus('File removed successfully!', 'success');
}

// Image processing
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set maximum dimensions
                const maxWidth = 1200;
                const maxHeight = 800;
                
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                // Resize image
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to optimized format
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                }, 'image/jpeg', 0.8);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Handle project image upload
async function handleImageUpload(projectId, file) {
    try {
        const project = sampleProjects.find(p => p.id === projectId);
        if (!project) return;

        const processedImageUrl = await processImage(file);
        project.image = processedImageUrl;
        displayProjects();
        showWalletStatus('Image processed and added successfully!', 'success');
    } catch (error) {
        console.error('Image processing error:', error);
        showWalletStatus('Failed to process image', 'error');
    }
}

// Enhanced project form submission
async function handleProjectSubmit(event) {
    event.preventDefault();
    
    if (!isWalletConnected) {
        showWalletStatus('Please connect your wallet first', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('submitting');

    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;
    const projectRepo = document.getElementById('project-repo').value;
    const projectImage = document.getElementById('project-image').files[0];

    try {
        // Create new project
        const newProject = {
            id: sampleProjects.length + 1,
            name: projectName,
            description: projectDescription,
            repo: projectRepo,
            files: [],
            image: null,
            timestamp: new Date().toISOString()
        };
        
        // Process image if provided
        if (projectImage) {
            await handleImageUpload(newProject.id, projectImage);
        }
        
        sampleProjects.push(newProject);
        displayProjects();
        projectForm.reset();
        
        // Success animation
        submitBtn.innerHTML = `
            <span class="btn-text">Project Created!</span>
            <span class="btn-icon">🎉</span>
        `;
        
        setTimeout(() => {
            submitBtn.innerHTML = `
                <span class="btn-text">Create Project</span>
                <span class="btn-icon">🚀</span>
            `;
        }, 2000);
        
        showWalletStatus('Project created successfully!', 'success');
    } catch (error) {
        console.error('Failed to create project:', error);
        showWalletStatus('Failed to create project. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('submitting');
    }
}

// Display projects in the grid with animations
function displayProjects() {
    projectsContainer.innerHTML = '';
    
    // Add AI Image Generation Section
    const aiSection = document.createElement('div');
    aiSection.className = 'ai-image-section';
    aiSection.innerHTML = `
        <h2>AI Image Generation</h2>
        <div class="ai-image-card">
            <div class="ai-image-preview">
                <img id="ai-preview" src="https://via.placeholder.com/400x300" alt="AI Generated Image">
            </div>
            <div class="ai-image-controls">
                <div class="form-group">
                    <label for="ai-prompt">Describe your image</label>
                    <textarea id="ai-prompt" placeholder="Enter a detailed description of the image you want to generate..."></textarea>
                </div>
                <div class="form-group">
                    <label for="ai-style">Style</label>
                    <select id="ai-style">
                        <option value="realistic">Realistic</option>
                        <option value="anime">Anime</option>
                        <option value="artistic">Artistic</option>
                        <option value="3d">3D Render</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="ai-size">Size</label>
                    <select id="ai-size">
                        <option value="512x512">512x512</option>
                        <option value="768x768">768x768</option>
                        <option value="1024x1024">1024x1024</option>
                    </select>
                </div>
                <button class="generate-btn" onclick="generateAIImage(document.getElementById('ai-prompt').value)">
                    <span class="btn-icon">🎨</span>
                    Generate Image
                </button>
            </div>
        </div>
    `;
    projectsContainer.appendChild(aiSection);
    
    // Display existing projects
    sampleProjects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-project-id', project.id);
        projectCard.style.animation = `slideInUp 0.5s ease ${index * 0.1}s both`;
        
        const projectImage = project.image ? `
            <div class="project-image">
                <img src="${project.image}" alt="${project.name}">
            </div>
        ` : '';
        
        const filesList = project.files.length > 0 ? `
            <div class="files-preview">
                <h4>Added Files</h4>
                <ul>
                    ${project.files.slice(0, 3).map(file => `
                        <li>${file.name}</li>
                    `).join('')}
                    ${project.files.length > 3 ? `<li>+${project.files.length - 3} more</li>` : ''}
                </ul>
            </div>
        ` : '';
        
        projectCard.innerHTML = `
            ${projectImage}
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <a href="${project.repo}" target="_blank" class="repo-link">View Repository</a>
            ${filesList}
            <div class="project-actions">
                <button class="action-btn" onclick="handleGitHubFiles(${project.id})">
                    <span class="btn-icon">📁</span>
                    Manage Files
                </button>
                <button class="action-btn" onclick="showAIImageModal(${project.id})">
                    <span class="btn-icon">🎨</span>
                    Generate AI Image
                </button>
                <label class="action-btn">
                    <span class="btn-icon">🖼️</span>
                    Upload Image
                    <input type="file" accept="image/*" style="display: none" 
                           onchange="handleImageUpload(${project.id}, this.files[0])">
                </label>
            </div>
        `;
        projectsContainer.appendChild(projectCard);
    });
}

// Event Listeners
connectWalletBtn.addEventListener('click', connectWallet);
projectForm.addEventListener('submit', handleProjectSubmit);
window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('click', (e) => {
    if (e.target === walletModal) {
        closeModal();
    }
});

// Initialize the page
displayProjects();
handleScrollAnimations();

// Add CSS for new features
const newFeaturesStyle = document.createElement('style');
newFeaturesStyle.textContent = `
    .github-files-modal .modal-content {
        max-width: 600px;
    }

    .github-files-form {
        margin-bottom: 2rem;
    }

    .files-list {
        margin-top: 2rem;
    }

    .files-container {
        max-height: 300px;
        overflow-y: auto;
        margin-top: 1rem;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.8rem;
        background: var(--card-bg);
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }

    .file-name {
        font-weight: 500;
        flex: 1;
    }

    .file-description {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .remove-file-btn {
        background: none;
        border: none;
        color: #f44336;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .remove-file-btn:hover {
        background: rgba(244, 67, 54, 0.1);
    }

    .project-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        border-radius: 10px;
        margin-bottom: 1rem;
    }

    .project-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .files-preview {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--card-bg);
        border-radius: 8px;
    }

    .files-preview h4 {
        margin-bottom: 0.5rem;
        color: var(--primary-color);
    }

    .files-preview ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .files-preview li {
        padding: 0.3rem 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .project-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .action-btn {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px var(--shadow-color);
    }
`;
document.head.appendChild(newFeaturesStyle);

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .project-card {
        background: var(--card-bg);
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 15px var(--shadow-color);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    
    .project-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px var(--shadow-color);
    }
    
    .project-card:hover::before {
        transform: scaleX(1);
    }
    
    .project-card h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .repo-link {
        display: inline-block;
        margin-top: 1rem;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        position: relative;
    }
    
    .repo-link::after {
        content: '→';
        margin-left: 5px;
        transition: transform 0.3s ease;
    }
    
    .repo-link:hover::after {
        transform: translateX(5px);
    }

    .connecting {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .submitting {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .wallet-status.success {
        color: #4CAF50;
    }

    .wallet-status.error {
        color: #f44336;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// AI Image Generation
async function generateAIImage(prompt) {
    try {
        const response = await fetch(AI_CONFIG.STABLE_DIFFUSION_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_CONFIG.API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: AI_CONFIG.MAX_STEPS,
                    guidance_scale: AI_CONFIG.GUIDANCE_SCALE
                }
            })
        });

        if (!response.ok) {
            throw new Error('Image generation failed');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('AI Image Generation Error:', error);
        throw error;
    }
}

// Show AI Image Generation Modal
function showAIImageModal(projectId) {
    const modal = document.createElement('div');
    modal.className = 'modal ai-image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Generate AI Image</h2>
            <div class="ai-image-form">
                <div class="form-group">
                    <label for="image-prompt">Image Description</label>
                    <textarea id="image-prompt" placeholder="Describe the image you want to generate..." required></textarea>
                </div>
                <div class="form-group">
                    <label for="image-style">Style</label>
                    <select id="image-style">
                        <option value="realistic">Realistic</option>
                        <option value="anime">Anime</option>
                        <option value="artistic">Artistic</option>
                        <option value="3d">3D Render</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="image-size">Size</label>
                    <select id="image-size">
                        <option value="512x512">512x512</option>
                        <option value="768x768">768x768</option>
                        <option value="1024x1024">1024x1024</option>
                    </select>
                </div>
                <button class="generate-btn" onclick="generateProjectImage(${projectId})">
                    <span class="btn-icon">🎨</span>
                    Generate Image
                </button>
            </div>
            <div class="image-preview-container">
                <div id="generated-image-preview"></div>
                <div class="image-editing-tools">
                    <button class="edit-btn" onclick="editGeneratedImage(${projectId})">
                        <span class="btn-icon">✏️</span>
                        Edit Image
                    </button>
                    <button class="save-btn" onclick="saveGeneratedImage(${projectId})">
                        <span class="btn-icon">💾</span>
                        Save Image
                    </button>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Generate Project Image
async function generateProjectImage(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) return;

    const promptInput = document.getElementById('image-prompt');
    const styleSelect = document.getElementById('image-style');
    const sizeSelect = document.getElementById('image-size');
    const generateBtn = document.querySelector('.generate-btn');
    const previewContainer = document.getElementById('generated-image-preview');

    if (!promptInput.value) {
        showWalletStatus('Please enter an image description', 'error');
        return;
    }

    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <span class="btn-icon">⚡</span>
            Generating...
        `;

        // Construct prompt with style
        const style = styleSelect.value;
        const size = sizeSelect.value;
        const fullPrompt = `${promptInput.value}, ${style} style, ${size} resolution, high quality, detailed`;

        // Generate image
        const imageUrl = await generateAIImage(fullPrompt);
        
        // Display preview
        previewContainer.innerHTML = `
            <img src="${imageUrl}" alt="Generated Image">
            <div class="image-controls">
                <button onclick="regenerateImage(${projectId})">
                    <span class="btn-icon">🔄</span>
                    Regenerate
                </button>
                <button onclick="editGeneratedImage(${projectId})">
                    <span class="btn-icon">✏️</span>
                    Edit
                </button>
            </div>
        `;

        // Store generated image URL
        project.generatedImage = imageUrl;

        showWalletStatus('Image generated successfully!', 'success');
    } catch (error) {
        console.error('Image generation error:', error);
        showWalletStatus('Failed to generate image', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <span class="btn-icon">🎨</span>
            Generate Image
        `;
    }
}

// Edit Generated Image
function editGeneratedImage(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project || !project.generatedImage) return;

    const modal = document.createElement('div');
    modal.className = 'modal image-editor-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Image</h2>
            <div class="image-editor">
                <div class="editor-tools">
                    <div class="tool-group">
                        <label>Brightness</label>
                        <input type="range" id="brightness" min="0" max="200" value="100">
                    </div>
                    <div class="tool-group">
                        <label>Contrast</label>
                        <input type="range" id="contrast" min="0" max="200" value="100">
                    </div>
                    <div class="tool-group">
                        <label>Saturation</label>
                        <input type="range" id="saturation" min="0" max="200" value="100">
                    </div>
                    <div class="tool-group">
                        <label>Blur</label>
                        <input type="range" id="blur" min="0" max="10" value="0">
                    </div>
                </div>
                <div class="editor-preview">
                    <img id="editable-image" src="${project.generatedImage}" alt="Editable Image">
                </div>
            </div>
            <div class="editor-actions">
                <button class="reset-btn" onclick="resetImageEdit()">
                    <span class="btn-icon">↺</span>
                    Reset
                </button>
                <button class="save-btn" onclick="saveImageEdit(${projectId})">
                    <span class="btn-icon">💾</span>
                    Save Changes
                </button>
            </div>
            <div class="modal-buttons">
                <button class="modal-btn primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Add event listeners for image editing
    const image = document.getElementById('editable-image');
    const brightness = document.getElementById('brightness');
    const contrast = document.getElementById('contrast');
    const saturation = document.getElementById('saturation');
    const blur = document.getElementById('blur');

    function updateImage() {
        image.style.filter = `
            brightness(${brightness.value}%)
            contrast(${contrast.value}%)
            saturate(${saturation.value}%)
            blur(${blur.value}px)
        `;
    }

    brightness.addEventListener('input', updateImage);
    contrast.addEventListener('input', updateImage);
    saturation.addEventListener('input', updateImage);
    blur.addEventListener('input', updateImage);
}

// Reset Image Edit
function resetImageEdit() {
    const image = document.getElementById('editable-image');
    const brightness = document.getElementById('brightness');
    const contrast = document.getElementById('contrast');
    const saturation = document.getElementById('saturation');
    const blur = document.getElementById('blur');

    brightness.value = 100;
    contrast.value = 100;
    saturation.value = 100;
    blur.value = 0;

    image.style.filter = 'none';
}

// Save Image Edit
function saveImageEdit(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) return;

    const image = document.getElementById('editable-image');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    ctx.filter = image.style.filter;
    ctx.drawImage(image, 0, 0);
    
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        project.image = url;
        displayProjects();
        showWalletStatus('Image edited and saved successfully!', 'success');
        document.querySelector('.image-editor-modal').remove();
    }, 'image/jpeg', 0.8);
}

// Regenerate Image
async function regenerateImage(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project) return;

    const promptInput = document.getElementById('image-prompt');
    const styleSelect = document.getElementById('image-style');
    const sizeSelect = document.getElementById('image-size');

    try {
        // Add random seed to prompt for variation
        const randomSeed = Math.floor(Math.random() * 1000000);
        const fullPrompt = `${promptInput.value}, ${styleSelect.value} style, ${sizeSelect.value} resolution, high quality, detailed, seed:${randomSeed}`;

        const imageUrl = await generateAIImage(fullPrompt);
        
        document.getElementById('generated-image-preview').innerHTML = `
            <img src="${imageUrl}" alt="Generated Image">
            <div class="image-controls">
                <button onclick="regenerateImage(${projectId})">
                    <span class="btn-icon">🔄</span>
                    Regenerate
                </button>
                <button onclick="editGeneratedImage(${projectId})">
                    <span class="btn-icon">✏️</span>
                    Edit
                </button>
            </div>
        `;

        project.generatedImage = imageUrl;
        showWalletStatus('Image regenerated successfully!', 'success');
    } catch (error) {
        console.error('Image regeneration error:', error);
        showWalletStatus('Failed to regenerate image', 'error');
    }
}

// Save Generated Image
function saveGeneratedImage(projectId) {
    const project = sampleProjects.find(p => p.id === projectId);
    if (!project || !project.generatedImage) return;

    project.image = project.generatedImage;
    displayProjects();
    showWalletStatus('Image saved to project!', 'success');
    document.querySelector('.ai-image-modal').remove();
}

// Add CSS for AI image features
const aiImageStyle = document.createElement('style');
aiImageStyle.textContent = `
    .ai-image-modal .modal-content {
        max-width: 800px;
    }

    .ai-image-form {
        margin-bottom: 2rem;
    }

    .ai-image-form textarea {
        min-height: 100px;
        margin-bottom: 1rem;
    }

    .image-preview-container {
        margin-top: 2rem;
        text-align: center;
    }

    .image-preview-container img {
        max-width: 100%;
        max-height: 500px;
        border-radius: 10px;
        margin-bottom: 1rem;
    }

    .image-controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
    }

    .image-editor-modal .modal-content {
        max-width: 1000px;
    }

    .image-editor {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
        margin: 2rem 0;
    }

    .editor-tools {
        background: var(--card-bg);
        padding: 1rem;
        border-radius: 10px;
    }

    .tool-group {
        margin-bottom: 1.5rem;
    }

    .tool-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }

    .tool-group input[type="range"] {
        width: 100%;
    }

    .editor-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-bg);
        padding: 1rem;
        border-radius: 10px;
    }

    .editor-preview img {
        max-width: 100%;
        max-height: 500px;
        border-radius: 5px;
    }

    .editor-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
    }

    .generate-btn {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        margin-top: 1rem;
    }

    .generate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px var(--shadow-color);
    }

    .generate-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .image-controls button {
        background: var(--card-bg);
        color: var(--text-color);
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .image-controls button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px var(--shadow-color);
    }

    .reset-btn, .save-btn {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .reset-btn:hover, .save-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px var(--shadow-color);
    }
`;
document.head.appendChild(aiImageStyle);

// Add CSS for AI image section
const aiImageSectionStyle = document.createElement('style');
aiImageSectionStyle.textContent = `
    .ai-image-section {
        margin-bottom: 3rem;
        padding: 2rem;
        background: var(--card-bg);
        border-radius: 15px;
        box-shadow: 0 4px 15px var(--shadow-color);
    }

    .ai-image-section h2 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .ai-image-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
    }

    .ai-image-preview {
        width: 100%;
        height: 300px;
        background: var(--bg-color);
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ai-image-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .ai-image-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .ai-image-controls .form-group {
        margin-bottom: 1rem;
    }

    .ai-image-controls textarea {
        width: 100%;
        min-height: 100px;
        padding: 0.8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-color);
        color: var(--text-color);
        resize: vertical;
    }

    .ai-image-controls select {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-color);
        color: var(--text-color);
    }

    .ai-image-controls .generate-btn {
        margin-top: 1rem;
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 25px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .ai-image-controls .generate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px var(--shadow-color);
    }

    @media (max-width: 768px) {
        .ai-image-card {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(aiImageSectionStyle); 