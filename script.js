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

async function getImagesBySequentialNames() {
    const foundImages = [];
    const maxImagesToCheck = 50;
    let missingStreak = 0;
    let foundAny = false;

    for (let index = 1; index <= maxImagesToCheck; index++) {
        let foundForCurrentIndex = false;

        for (const ext of imageExtensions) {
            const candidatePath = `img/${index}${ext}`;
            const exists = await checkImageExists(candidatePath);

            if (exists) {
                foundImages.push(candidatePath);
                foundAny = true;
                foundForCurrentIndex = true;
                break;
            }
        }

        if (foundForCurrentIndex) {
            missingStreak = 0;
        } else if (foundAny) {
            missingStreak++;
        }

        if (foundAny && missingStreak >= 1) {
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
    const sequentialImages = await getImagesBySequentialNames();
    renderGallery(sequentialImages);
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
