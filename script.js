// Initialize Petra wallet adapter
let wallet = null;
let isWalletConnected = false;
let userAddress = null;

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

// Separate existing projects from user-created projects
const existingProjects = [
    {
        id: 1,
        name: "DeFi Dashboard",
        description: "A comprehensive dashboard for tracking DeFi metrics on Aptos",
        repo: "https://github.com/example/defi-dashboard",
        files: [],
        image: null,
        confirmed: true
    },
    {
        id: 2,
        name: "NFT Marketplace",
        description: "A decentralized marketplace for trading NFTs on Aptos",
        repo: "https://github.com/example/nft-marketplace",
        files: [],
        image: null,
        confirmed: true
    }
];

// User-created projects
const userProjects = [];

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
    const project = existingProjects.find(p => p.id === projectId) || userProjects.find(p => p.id === projectId);
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
    const project = existingProjects.find(p => p.id === projectId) || userProjects.find(p => p.id === projectId);
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
    const project = existingProjects.find(p => p.id === projectId) || userProjects.find(p => p.id === projectId);
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
        const project = existingProjects.find(p => p.id === projectId) || userProjects.find(p => p.id === projectId);
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

// Update handleProjectSubmit to add to userProjects
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
            id: Date.now(),
            name: projectName,
            description: projectDescription,
            repo: projectRepo,
            files: [],
            image: null,
            timestamp: new Date().toISOString(),
            confirmed: false
        };
        // Process image if provided
        if (projectImage) {
            await handleImageUpload(newProject.id, projectImage);
        }
        userProjects.push(newProject);
        displayProjects();
        projectForm.reset();
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

// Update confirmProjectCreation to move project to existingProjects
async function confirmProjectCreation(projectId) {
    if (!isWalletConnected) {
        showWalletStatus('Please connect your wallet first', 'error');
        return;
    }
    const projectIndex = userProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
        showWalletStatus('Project not found', 'error');
        return;
    }
    const project = userProjects[projectIndex];
    try {
        // Example transaction payload (customize as needed)
        const payload = {
            type: 'entry_function_payload',
            function: '0x1::aptos_account::transfer',
            arguments: [userAddress, 1], // Dummy transaction: send 1 token to self
            type_arguments: []
        };
        const response = await wallet.signAndSubmitTransaction(payload);
        showWalletStatus('Transaction submitted! Hash: ' + response.hash, 'success');
        // Mark as confirmed and move to existingProjects
        project.confirmed = true;
        existingProjects.push(project);
        userProjects.splice(projectIndex, 1);
        displayProjects();
    } catch (error) {
        console.error('Transaction error:', error);
        showWalletStatus('Transaction failed. Please try again.', 'error');
    }
}

// Update displayProjects to show two sections
function displayProjects() {
    projectsContainer.innerHTML = '';
    // Existing Projects Section
    if (existingProjects.length > 0) {
        const existingSection = document.createElement('div');
        existingSection.className = 'existing-projects-section';
        existingSection.innerHTML = '<h2>Already Existing Projects</h2>';
        existingProjects.forEach((project, index) => {
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
            const confirmedLabel = `<div class="confirmed-label">✅ Confirmed</div>`;
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
                    <label class="action-btn">
                        <span class="btn-icon">🖼️</span>
                        Upload Image
                        <input type="file" accept="image/*" style="display: none" 
                               onchange="handleImageUpload(${project.id}, this.files[0])">
                    </label>
                    ${confirmedLabel}
                </div>
            `;
            existingSection.appendChild(projectCard);
        });
        projectsContainer.appendChild(existingSection);
    }
    // User Projects Section (pending confirmation)
    if (userProjects.length > 0) {
        const userSection = document.createElement('div');
        userSection.className = 'user-projects-section';
        userSection.innerHTML = '<h2>New Projects (Pending Confirmation)</h2>';
        userProjects.forEach((project, index) => {
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
            const confirmButton = `
                <button class="action-btn confirm-btn" onclick="confirmProjectCreation(${project.id})">
                    <span class="btn-icon">✅</span>
                    Confirm Creation
                </button>
            `;
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
                    <label class="action-btn">
                        <span class="btn-icon">🖼️</span>
                        Upload Image
                        <input type="file" accept="image/*" style="display: none" 
                               onchange="handleImageUpload(${project.id}, this.files[0])">
                    </label>
                    ${confirmButton}
                </div>
            `;
            userSection.appendChild(projectCard);
        });
        projectsContainer.appendChild(userSection);
    }
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
