<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Registrasi Mahasiswa</h1>
        <p class="text-slate-500 mt-2">Buat akun untuk pendaftaran pembekalan</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">NIM</label>
          <input v-model="form.nim" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Program Studi</label>
          <select v-model="form.prodi" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <option value="Teknologi Rekayasa Komputer">Teknologi Rekayasa Komputer</option>
            <option value="Teknologi Rekayasa Perangkat Lunak">Teknologi Rekayasa Perangkat Lunak</option>
            <option value="Komunikasi Digital dan Media">Komunikasi Digital dan Media</option>
            <option value="Akuntansi">Akuntansi</option>
            <option value="Manajemen Informatika">Manajemen Informatika</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Angkatan</label>
          <select v-model="form.angkatan" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <option value="58">58</option>
            <option value="59">59</option>
            <option value="60">60</option>
            <option value="61">61</option>
            <option value="62">62</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">No HP</label>
          <input v-model="form.phone" type="text" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input v-model="form.password" type="password" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password Ulang</label>
          <input v-model="form.confirmPassword" type="password" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
        </div>

        <div v-if="error" class="md:col-span-2 text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
          {{ error }}
        </div>

        <div class="md:col-span-2 flex space-x-4">
          <button type="button" @click="router.push('/login')" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition-colors">
            Batal
          </button>
          <button type="submit" :disabled="loading" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center">
            <span v-if="loading" class="animate-spin mr-2">
              <Loader2 :size="18" />
            </span>
            {{ loading ? 'Memproses...' : 'Daftar' }}
          </button>
        </div>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-slate-600">
          Sudah punya akun? 
          <router-link to="/login" class="text-indigo-600 font-medium hover:underline">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Loader2 } from 'lucide-vue-next';

const form = reactive({
  name: '',
  nim: '',
  prodi: 'Teknologi Rekayasa Komputer',
  angkatan: '61',
  phone: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Password tidak cocok!';
    return;
  }
  
  loading.value = true;
  error.value = '';
  try {
    const { confirmPassword, ...registerData } = form;
    await axios.post('/api/auth/register', registerData);
    alert('Registrasi berhasil! Silakan login.');
    router.push('/login');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>
