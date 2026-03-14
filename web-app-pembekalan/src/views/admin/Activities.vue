<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Daftar Kegiatan</h2>
      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
        <Plus :size="20" />
        <span>Tambah Kegiatan</span>
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">Nama Kegiatan</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Tanggal</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Waktu</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Lokasi</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="activity in activities" :key="activity.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ activity.name }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ formatDate(activity.date) }}</td>
            <td class="px-6 py-4 text-slate-600">{{ formatTime(activity.time) }}</td>
            <td class="px-6 py-4 text-slate-600">{{ activity.location }}</td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button @click="openModal(activity)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil :size="18" />
                </button>
                <button type="button" @click="deleteActivity(activity)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Kegiatan">
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="activities.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-slate-500">Belum ada kegiatan.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl w-full max-w-lg p-8">
        <h3 class="text-xl font-bold mb-6">{{ editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan' }}</h3>
        <form @submit.prevent="saveActivity" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nama Kegiatan</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input v-model="form.date" type="date" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Waktu</label>
              <input v-model="form.time" type="time" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
            <input v-model="form.location" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Materi Pembekalan (Opsional - PDF/Doc)</label>
            <div class="flex items-center space-x-2">
              <input type="file" @change="handleFileUpload" class="hidden" ref="fileInput" accept=".pdf,.doc,.docx">
              <button type="button" @click="fileInput?.click()" :disabled="uploading || saving" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50">
                <Upload :size="18" />
                <span>{{ uploading ? 'Uploading...' : 'Pilih File' }}</span>
              </button>
              <div v-if="form.material_url" class="flex items-center space-x-2 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                <span class="text-[10px] text-emerald-700 font-medium truncate max-w-[150px]">File terupload</span>
                <button type="button" @click="form.material_url = ''" class="text-emerald-700 hover:text-red-600">
                  <X :size="14" />
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-8">
            <button type="button" @click="showModal = false" :disabled="saving || uploading" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">Batal</button>
            <button type="submit" :disabled="saving || uploading" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
              <span v-if="saving">Menyimpan...</span>
              <span v-else>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div class="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 :size="32" />
        </div>
        <h3 class="text-xl font-bold text-center mb-2">Hapus Kegiatan?</h3>
        <p class="text-slate-600 text-center text-sm mb-8">
          Apakah Anda yakin ingin menghapus <strong>{{ activityToDelete?.name }}</strong>? 
          Seluruh data pendaftaran mahasiswa terkait juga akan terhapus secara permanen.
        </p>
        <div class="flex flex-col space-y-3">
          <button 
            @click="confirmDelete" 
            :disabled="deleting"
            class="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus Permanen' }}
          </button>
          <button 
            @click="showDeleteModal = false" 
            :disabled="deleting"
            class="w-full py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-vue-next';

const activities = ref<any[]>([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const activityToDelete = ref<any>(null);
const uploading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const editingId = ref<number | null>(null);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  // Handle YYYY-MM-DD format
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  // Handle HH:mm format
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
    return `${hours}:${minutes}:${seconds}`;
  }
  return timeStr;
};

const form = reactive({
  name: '',
  description: '',
  date: '',
  time: '',
  location: '',
  material_url: ''
});

const fetchActivities = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/activities', {
      headers: { Authorization: `Bearer ${token}` }
    });
    activities.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const openModal = (activity: any = null) => {
  if (activity) {
    editingId.value = activity.id;
    form.name = activity.name;
    form.description = activity.description;
    form.date = activity.date;
    form.time = activity.time;
    form.location = activity.location;
    form.material_url = activity.material_url || '';
  } else {
    editingId.value = null;
    form.name = '';
    form.description = '';
    form.date = '';
    form.time = '';
    form.location = '';
    form.material_url = '';
  }
  showModal.value = true;
};

const handleFileUpload = async (event: any) => {
  const file = event.target.files[0];
  if (!file) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Sesi berakhir, silakan login kembali');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  uploading.value = true;
  try {
    const response = await axios.post('/api/admin/upload-material', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    form.material_url = response.data.url;
    alert('File berhasil diupload');
  } catch (err: any) {
    console.error('Upload failed', err);
    alert(err.response?.data?.error || 'Gagal mengupload file');
  } finally {
    uploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const saveActivity = async () => {
  if (saving.value) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Sesi berakhir, silakan login kembali');
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      await axios.put(`/api/admin/activities/${editingId.value}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post('/api/admin/activities', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    showModal.value = false;
    await fetchActivities();
    alert('Kegiatan berhasil disimpan');
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.error || 'Gagal menyimpan kegiatan');
  } finally {
    saving.value = false;
  }
};

const deleteActivity = (activity: any) => {
  activityToDelete.value = activity;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!activityToDelete.value || deleting.value) return;
  
  deleting.value = true;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/admin/activities/${activityToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showDeleteModal.value = false;
    await fetchActivities();
    alert('Kegiatan berhasil dihapus');
  } catch (err: any) {
    console.error('Delete error details:', err);
    const errorMessage = err.response?.data?.error || 'Gagal menghapus kegiatan. Silakan coba lagi.';
    alert(errorMessage);
  } finally {
    deleting.value = false;
    activityToDelete.value = null;
  }
};

onMounted(fetchActivities);
</script>
