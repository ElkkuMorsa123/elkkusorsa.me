let viewAllExpanded = false;

const viewAllBtn = document.getElementById('viewAllBtn');
const gallery = document.getElementById('gallery');
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

function isImageFile(fileName) {
    const lowerName = fileName.toLowerCase();
    return imageExtensions.some((ext) => lowerName.endsWith(ext));
}

function sortFilesNatural(files) {
    return files.sort((a, b) => b.localeCompare(a, 'fi', { numeric: true, sensitivity: 'base' }));
}

async function getImagesFromDirectoryListing() {
    const response = await fetch('img/');

    if (!response.ok) {
        throw new Error('Directory listing ei ole saatavilla');
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    const files = links
        .map((link) => link.getAttribute('href') || '')
        .map((href) => decodeURIComponent(href.trim()))
        .filter((href) => href && !href.endsWith('/') && isImageFile(href))
        .map((href) => href.replace(/^\.\//, ''));

    return sortFilesNatural(Array.from(new Set(files))).map((file) => `img/${file}`);
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
    const maxImagesToCheck = 300;
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

        if (foundAny && missingStreak >= 20) {
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
    try {
        const images = await getImagesFromDirectoryListing();
        renderGallery(images);
    } catch {
        const sequentialImages = await getImagesBySequentialNames();

        if (sequentialImages.length > 0) {
            renderGallery(sequentialImages);
        } else {
            renderGallery(['img/6.png', 'img/5.png', 'img/4.png', 'img/3.png', 'img/2.png', 'img/1.png']);
        }
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
