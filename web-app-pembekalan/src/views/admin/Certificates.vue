<template>
  <div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="px-6 py-4 font-semibold text-slate-700">Mahasiswa</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Kegiatan</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Tanggal Lulus</th>
            <th class="px-6 py-4 font-semibold text-slate-700">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in certificates" :key="c.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ c.user_name }}</div>
              <div class="text-xs text-slate-500">{{ c.nim }} | {{ c.prodi }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ c.activity_name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ c.date }}</td>
            <td class="px-6 py-4">
              <button @click="downloadCertificate(c)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm">
                <Download :size="16" />
                <span>Download</span>
              </button>
            </td>
          </tr>
          <tr v-if="certificates.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-slate-500">Belum ada sertifikat yang dapat dikelola.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Download } from 'lucide-vue-next';
import { jsPDF } from 'jspdf';

const certificates = ref<any[]>([]);

const fetchCertificates = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    certificates.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const downloadCertificate = (reg: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Background
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 297, 210, 'F');

  // Border
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 273, 186);

  // Content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(40);
  doc.text('SERTIFIKAT', 148.5, 50, { align: 'center' });
  
  doc.setFontSize(20);
  doc.text('Diberikan kepada:', 148.5, 70, { align: 'center' });
  
  doc.setFontSize(30);
  doc.setTextColor(79, 70, 229);
  doc.text(reg.user_name, 148.5, 90, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(71, 85, 105);
  doc.text(`NIM: ${reg.nim}`, 148.5, 100, { align: 'center' });

  doc.text('Atas keberhasilannya menyelesaikan kegiatan:', 148.5, 120, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59);
  doc.text(reg.activity_name, 148.5, 135, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`Diselenggarakan pada tanggal ${reg.date}`, 148.5, 150, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text('STATUS: LULUS', 148.5, 170, { align: 'center' });

  doc.save(`Sertifikat_${reg.nim}_${reg.activity_name}.pdf`);
};

onMounted(fetchCertificates);
</script>
