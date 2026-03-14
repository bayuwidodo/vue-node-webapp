<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Login</h1>
        <p class="text-slate-500 mt-2">Sistem Pendaftaran Pembekalan</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="email@example.com">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••">
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-6 text-center space-y-2">
        <p class="text-sm text-slate-600">
          Belum punya akun? 
          <router-link to="/register" class="text-indigo-600 font-medium hover:underline">Daftar Sekarang</router-link>
        </p>
        <a href="#" class="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Lupa Password?</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value
    });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    if (response.data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/student');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>
