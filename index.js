import { GoogleGenAI, Type } from "@google/genai";

const BookStatus = {
  ToRead: 'Por Leer',
  Reading: 'Leyendo',
  Read: 'Leído',
};

// --- Sample Data & State ---
let books = [
  { id: '1', title: 'El Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasía', coverUrl: 'https://picsum.photos/seed/thehobbit/300/400', status: BookStatus.Read, publicationYear: '1937', isbn: '978-0-345-33968-3' },
  { id: '2', title: 'Dune', author: 'Frank Herbert', genre: 'Ciencia Ficción', coverUrl: 'https://picsum.photos/seed/dune/300/400', status: BookStatus.Reading, publicationYear: '1965', isbn: '978-0-441-01359-3' },
  { id: '3', title: '1984', author: 'George Orwell', genre: 'Distopía', coverUrl: 'https://picsum.photos/seed/1984/300/400', status: BookStatus.Read, publicationYear: '1949', isbn: '978-0-452-28423-4' },
  { id: '4', title: 'Proyecto Hail Mary', author: 'Andy Weir', genre: 'Ciencia Ficción', coverUrl: 'https://picsum.photos/seed/hailmary/300/400', status: BookStatus.ToRead, publicationYear: '2021', isbn: '978-0-593-13520-4' },
];

let editingBookId = null;
let searchTerm = '';
let sortBy = 'title_asc';
let cameraStream = null;


// --- DOM Elements ---
const bookList = document.getElementById('book-list');
const bookForm = document.getElementById('book-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const statusSelect = document.getElementById('status');
const noResults = document.getElementById('no-results');
const formContainer = document.getElementById('form-container');

// Camera Modal Elements
const cameraModal = document.getElementById('camera-modal');
const openCameraBtn = document.getElementById('open-camera-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const video = document.getElementById('camera-video');
const canvas = document.getElementById('camera-canvas');

// Gemini API Elements
const loader = document.getElementById('loader');
const apiError = document.getElementById('api-error');
const apiErrorMessage = document.getElementById('api-error-message');


// --- Render Functions ---
function renderBooks() {
    bookList.innerHTML = '';
    
    const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
        const [key, order] = sortBy.split('_');
        const valA = a[key]?.toString().toLowerCase() || '';
        const valB = b[key]?.toString().toLowerCase() || '';
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    if (sorted.length === 0) {
        noResults.classList.remove('hidden');
        bookList.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        bookList.classList.remove('hidden');
    }

    sorted.forEach(book => {
        const bookCard = createBookCard(book);
        bookList.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = "bg-surface rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col";
    
    const statusColor = {
        [BookStatus.Read]: 'bg-green-600',
        [BookStatus.Reading]: 'bg-blue-600',
        [BookStatus.ToRead]: 'bg-yellow-600',
    };
    
    card.innerHTML = `
        <img src="${book.coverUrl}" alt="Portada de ${book.title}" class="w-full h-64 object-cover">
        <div class="p-4 flex flex-col flex-grow">
            <span class="text-xs font-semibold px-2 py-1 rounded-full text-white self-start ${statusColor[book.status]}">${book.status}</span>
            <h3 class="text-xl font-bold text-text-primary mt-2 truncate">${book.title}</h3>
            <p class="text-text-secondary mt-1">${book.author}</p>
            <div class="text-sm text-gray-400 mt-1 space-y-1">
                <p class="italic">${book.genre}</p>
                ${book.publicationYear ? `<p>Año: ${book.publicationYear}</p>` : ''}
                ${book.isbn ? `<p>ISBN: ${book.isbn}</p>` : ''}
            </div>
            <div class="mt-4 pt-4 border-t border-gray-700 flex justify-end space-x-2 flex-shrink-0">
                <button data-id="${book.id}" class="edit-btn p-2 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors" aria-label="Editar libro">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                </button>
                <button data-id="${book.id}" class="delete-btn p-2 rounded-full text-gray-300 hover:bg-red-500 hover:text-white transition-colors" aria-label="Eliminar libro">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
    `;

    card.querySelector('.edit-btn').addEventListener('click', () => handleEdit(book.id));
    card.querySelector('.delete-btn').addEventListener('click', () => handleDelete(book.id));

    return card;
}

// --- Form & CRUD Logic ---
function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(bookForm);
    const bookData = Object.fromEntries(formData.entries());

    if (!bookData.coverUrl) {
        bookData.coverUrl = `https://picsum.photos/seed/${bookData.title.replace(/\s/g, '')}/300/400`;
    }

    if (editingBookId) {
        books = books.map(book => book.id === editingBookId ? { ...book, ...bookData } : book);
    } else {
        const newBook = { ...bookData, id: Date.now().toString() };
        books.unshift(newBook);
    }

    resetForm();
    renderBooks();
}

function handleEdit(id) {
    const bookToEdit = books.find(book => book.id === id);
    if (!bookToEdit) return;

    editingBookId = id;

    // Populate form
    for (const key in bookToEdit) {
        if (bookForm.elements[key]) {
            bookForm.elements[key].value = bookToEdit[key];
        }
    }

    // Update UI
    formTitle.textContent = 'Editar Libro';
    submitBtn.innerHTML = 'Actualizar Libro';
    cancelEditBtn.classList.remove('hidden');
    openCameraBtn.classList.add('hidden');
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function handleDelete(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        books = books.filter(book => book.id !== id);
        if (id === editingBookId) {
            resetForm();
        }
        renderBooks();
    }
}

function resetForm() {
    bookForm.reset();
    editingBookId = null;
    formTitle.textContent = 'Añadir un Nuevo Libro';
    submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Añadir Libro
    `;
    cancelEditBtn.classList.add('hidden');
    openCameraBtn.classList.remove('hidden');
    hideApiError();
}


// --- Camera Logic ---
async function openCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = cameraStream;
        cameraModal.classList.remove('hidden');
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Por favor, asegúrate de haber dado permiso.");
    }
}

function closeCamera() {
    cameraStream?.getTracks().forEach(track => track.stop());
    cameraModal.classList.add('hidden');
}

function handleCapture() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg');
    closeCamera();
    processImageWithGemini(dataUrl);
}

// --- Gemini API Logic ---

async function processImageWithGemini(base64Image) {
    loader.classList.remove('hidden');
    hideApiError();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const imagePart = {
            inlineData: {
                data: base64Image.split(',')[1],
                mimeType: 'image/jpeg'
            }
        };

        const textPart = {
            text: "Analiza esta imagen de la portada de un libro. Extrae el título, autor, género, ISBN (si está disponible) y año de publicación. Si no encuentras un campo, devuélvelo como una cadena vacía. Proporciona la respuesta como un objeto JSON."
        };
        
        const bookSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                genre: { type: Type.STRING },
                publicationYear: { type: Type.STRING },
                isbn: { type: Type.STRING },
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: bookSchema,
            },
        });

        const bookData = JSON.parse(response.text);
        
        // Populate form with extracted data
        bookForm.elements.title.value = bookData.title || '';
        bookForm.elements.author.value = bookData.author || '';
        bookForm.elements.genre.value = bookData.genre || '';
        bookForm.elements.publicationYear.value = bookData.publicationYear || '';
        bookForm.elements.isbn.value = bookData.isbn || '';
        
        formContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Error procesando imagen con Gemini:", error);
        showApiError("No se pudieron extraer los detalles. Inténtalo de nuevo.");
    } finally {
        loader.classList.add('hidden');
    }
}

function showApiError(message) {
    apiErrorMessage.textContent = message;
    apiError.classList.remove('hidden');
}

function hideApiError() {
    apiError.classList.add('hidden');
}


// --- Initialization & Event Listeners ---
function initialize() {
    // Populate status dropdown
    Object.values(BookStatus).forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });

    // Initial render
    renderBooks();

    // Form listeners
    bookForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);

    // Search and sort listeners
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderBooks();
    });
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderBooks();
    });

    // Camera listeners
    openCameraBtn.addEventListener('click', openCamera);
    closeCameraBtn.addEventListener('click', closeCamera);
    captureBtn.addEventListener('click', handleCapture);
}

document.addEventListener('DOMContentLoaded', initialize);
