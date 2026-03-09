let viewAllExpanded = false;

const viewAllBtn = document.getElementById('viewAllBtn');
const gallery = document.getElementById('gallery');
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

function sortFilesNatural(files) {
    return files.sort((a, b) => b.localeCompare(a, 'fi', { numeric: true, sensitivity: 'base' }));
}

function checkImageExists(path) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = path;
    });
}

async function getAdditionalImages(startIndex) {
    const foundImages = [];
    const maxImagesToCheck = 50;
    let missingStreak = 0;

    for (let index = startIndex; index <= maxImagesToCheck; index++) {
        let foundForCurrentIndex = false;

        for (const ext of imageExtensions) {
            const candidatePath = `img/${index}${ext}`;
            const exists = await checkImageExists(candidatePath);

            if (exists) {
                foundImages.push(candidatePath);
                foundForCurrentIndex = true;
                break;
            }
        }

        if (foundForCurrentIndex) {
            missingStreak = 0;
        } else {
            missingStreak++;
        }

        if (missingStreak >= 1) {
            break;
        }
    }

    return sortFilesNatural(foundImages);
}

function renderGallery(imagePaths) {
    gallery.innerHTML = '';

    imagePaths.forEach((path, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        if (index >= 6) {
            galleryItem.classList.add('hidden');
        }

        const img = document.createElement('img');
        img.src = path;
        img.alt = `Minecraft kartta ${index + 1}`;

        galleryItem.appendChild(img);
        gallery.appendChild(galleryItem);
    });

    if (imagePaths.length <= 6) {
        viewAllBtn.style.display = 'none';
    } else {
        viewAllBtn.style.display = 'inline-block';
        viewAllBtn.textContent = 'Näytä Kaikki';
        viewAllExpanded = false;
    }
}

async function initializeGallery() {
    // Load first 6 images immediately for fast initial display
    const initialImages = ['img/6.png', 'img/5.png', 'img/4.png', 'img/3.png', 'img/2.png', 'img/1.png'];
    renderGallery(initialImages);
    
    // Check for additional images in the background
    const additionalImages = await getAdditionalImages(7);
    
    if (additionalImages.length > 0) {
        const allImages = [...additionalImages, ...initialImages];
        renderGallery(sortFilesNatural(allImages));
    }
}

window.addEventListener('load', initializeGallery);

viewAllBtn.addEventListener('click', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (viewAllExpanded) {
        galleryItems.forEach((item, index) => {
            if (index >= 6) {
                item.classList.add('hidden');
            }
        });
        viewAllBtn.textContent = 'Näytä Kaikki';
        viewAllExpanded = false;
    } else {
        galleryItems.forEach(item => {
            item.classList.remove('hidden');
        });
        viewAllBtn.textContent = 'Piilota';
        viewAllExpanded = true;
    }
});
