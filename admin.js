const SUPABASE_URL = 'https://bagfttjjnztaoiklxbql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZ2Z0dGpqbnp0YW9pa2x4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODUyMDksImV4cCI6MjEwODc2MTIwOX0.zrNFCOkor_8CTBp8M90PYex3OCkTEWWFTWSc6b2frio';

// Mengubah nama variabel dari 'supabase' menjadi 'supabaseClient'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const uploadForm = document.getElementById('upload-form');
const projectsList = document.getElementById('projects-list');
const loadingState = document.getElementById('loading-state');
const submitBtn = document.getElementById('submit-btn');

// DOM Elements untuk Mode Edit
const formTitle = document.getElementById('form-title');
const editIdInput = document.getElementById('edit-id');
const existingImageInput = document.getElementById('existing-image-url');
const imageInput = document.getElementById('image');
const imageHint = document.getElementById('image-hint');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let allProjects = []; // Menyimpan data proyek yang sedang ditarik

// Auth Logic
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) showDashboard();
    else showLogin();
}

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') showDashboard();
    if (event === 'SIGNED_OUT') showLogin();
});

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    fetchProjects();
}

function showLogin() {
    dashboardSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    
    errorEl.classList.add('hidden');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
});

// Fetch & Render Projects
async function fetchProjects() {
    loadingState.classList.remove('hidden');
    projectsList.classList.add('hidden');

    const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        alert('Gagal mengambil data proyek.');
        return;
    }

    allProjects = data; // Simpan ke array global untuk fitur Edit
    renderProjects(data);
}

function renderProjects(projects) {
    projectsList.innerHTML = '';
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="text-center text-gray-500 py-4">Belum ada proyek.</p>';
    } else {
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors';
            card.innerHTML = `
                <div class="flex items-center gap-4">
                    <img src="${project.image_url}" alt="thumb" class="w-16 h-16 object-cover rounded-lg bg-gray-200">
                    <div>
                        <h4 class="font-bold text-dark text-sm">${project.title}</h4>
                        <span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">${project.category}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <!-- Edit Button -->
                    <button onclick="enterEditMode('${project.id}')" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <!-- Delete Button -->
                    <button onclick="deleteProject('${project.id}', '${project.image_url}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
            projectsList.appendChild(card);
        });
    }
    
    loadingState.classList.add('hidden');
    projectsList.classList.remove('hidden');
}

// ---------------------------
// FITUR EDIT (MODE SWITCHING)
// ---------------------------
window.enterEditMode = (id) => {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;

    // Isi Form
    document.getElementById('title').value = project.title;
    document.getElementById('category').value = project.category;
    document.getElementById('link').value = project.project_link;
    document.getElementById('description').value = project.description;
    
    // Set State Variables
    editIdInput.value = project.id;
    existingImageInput.value = project.image_url;

    // Ubah UI Form
    formTitle.textContent = "Edit Proyek";
    submitBtn.textContent = "Update Proyek";
    cancelEditBtn.classList.remove('hidden');
    imageHint.classList.remove('hidden');
    imageInput.required = false; // Karena gambar bisa jadi tidak diubah

    // Scroll otomatis ke form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Batalkan Edit (Kembali ke Mode Upload)
function resetFormMode() {
    uploadForm.reset();
    editIdInput.value = "";
    existingImageInput.value = "";
    
    formTitle.textContent = "Upload Proyek Baru";
    submitBtn.textContent = "Upload Proyek";
    cancelEditBtn.classList.add('hidden');
    imageHint.classList.add('hidden');
    imageInput.required = true;
}

cancelEditBtn.addEventListener('click', resetFormMode);

// ---------------------------
// SUBMIT FORM (UPLOAD & UPDATE LOGIC)
// ---------------------------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEditMode = editIdInput.value !== "";
    
    submitBtn.textContent = isEditMode ? 'Mengupdate...' : 'Mengunggah...';
    submitBtn.disabled = true;

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const link = document.getElementById('link').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    try {
        let finalImageUrl = existingImageInput.value;

        // 1. Eksekusi Storage (Jika ada file gambar baru yang dipilih)
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `public/${fileName}`;

            // Upload gambar baru
            const { error: uploadError } = await supabaseClient.storage
                .from('project_images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            // Dapatkan URL gambar baru
            const { data: { publicUrl } } = supabaseClient.storage
                .from('project_images')
                .getPublicUrl(filePath);

            finalImageUrl = publicUrl;

            // Opsional: Hapus gambar lama dari storage untuk menghemat memori
            if (isEditMode && existingImageInput.value) {
                const oldUrlParts = existingImageInput.value.split('/');
                const oldFilePath = `public/${oldUrlParts[oldUrlParts.length - 1]}`;
                await supabaseClient.storage.from('project_images').remove([oldFilePath]);
            }
        }

        // 2. Eksekusi Database (Update atau Insert)
        const projectData = { 
            title, 
            category, 
            project_link: link, 
            description, 
            image_url: finalImageUrl 
        };

        if (isEditMode) {
            const { error: updateError } = await supabaseClient
                .from('projects')
                .update(projectData)
                .eq('id', editIdInput.value);
            if (updateError) throw updateError;
            alert('Proyek berhasil diperbarui!');
        } else {
            const { error: insertError } = await supabaseClient
                .from('projects')
                .insert([projectData]);
            if (insertError) throw insertError;
            alert('Proyek berhasil diunggah!');
        }

        resetFormMode();
        fetchProjects();

    } catch (error) {
        console.error(error);
        alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
        submitBtn.textContent = isEditMode ? 'Update Proyek' : 'Upload Proyek';
        submitBtn.disabled = false;
    }
});

// Menghapus Proyek
window.deleteProject = async (id, imageUrl) => {
    if (!confirm('Yakin ingin menghapus proyek ini?')) return;

    try {
        const { error: dbError } = await supabaseClient.from('projects').delete().eq('id', id);
        if (dbError) throw dbError;

        const urlParts = imageUrl.split('/');
        const filePath = `public/${urlParts[urlParts.length - 1]}`;
        
        const { error: storageError } = await supabaseClient.storage
            .from('project_images')
            .remove([filePath]);

        if (storageError) console.warn('Gagal menghapus gambar di storage.', storageError);

        fetchProjects();
        if (editIdInput.value === id) resetFormMode(); // Reset form jika proyek yang dihapus sedang diedit

    } catch (error) {
        console.error(error);
        alert(`Gagal menghapus: ${error.message}`);
    }
};

checkAuth();