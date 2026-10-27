export const seed={
 articles:[],
 albums:[],
 videos:[],
 extracurriculars:[['Pramuka','Kegiatan kepramukaan untuk melatih kemandirian, kerja sama, dan kedisiplinan.'],["Tahfiz Al-Qur'an","Pembinaan hafalan dan kecintaan terhadap Al-Qur'an."],['Marawis','Pengembangan bakat musik dan seni Islami.'],['Pencak Silat','Latihan bela diri, kebugaran, dan pengendalian diri.'],['Futsal','Pengembangan keterampilan olahraga dan kerja sama tim.'],['Kaligrafi','Latihan menulis indah dan kreativitas seni kaligrafi.'],['Seni Islami','Wadah pengembangan kreativitas dan ekspresi seni bernuansa Islam.']].map(([title,description],i)=>({id:'extracurricular-'+i,title,description})),
 programs:[['Tahfiz Al-Qur\'an','Pembinaan hafalan Al-Qur\'an secara bertahap.'],['Shalat Berjamaah','Pembiasaan Shalat Dhuha dan Dzuhur berjamaah.'],['Membaca Al-Qur\'an','Menumbuhkan kecintaan terhadap Al-Qur\'an.'],['Karakter Islami','Pembelajaran adab, kedisiplinan, dan tanggung jawab.'],['P5RA','Projek Penguatan Profil Pelajar Pancasila dan Rahmatan lil Alamin.'],['Hari Besar Islam','Kegiatan keagamaan dan peringatan hari besar Islam.'],['Literasi dan Numerasi','Penguatan kemampuan membaca, menghitung, dan bernalar.'],['PAKEM','Pembelajaran aktif, kreatif, efektif, dan menyenangkan.']].map(([title,description],i)=>({id:'program-'+i,title,description})),
 facilities:['Ruang Kelas','Mushala','Perpustakaan','Laboratorium Komputer','Lapangan Upacara dan Olahraga','UKS','Kantin','Toilet Siswa dan Guru','Area Parkir','Internet / Wi-Fi','Ruang Guru','Ruang Kepala Madrasah'].map((title,i)=>({id:'facility-'+i,title,description:''})),
 gallery:[['kegiatan-pramuka','Kegiatan Pramuka'],['field-trip-edukatif','Field Trip'],['ekskul-pencak-silat','Pencak Silat'],['kegiatan-marawis','Marawis'],['pembiasaan-seni-islami','Seni Islami'],['ekskul-bendera','Kegiatan Bendera'],['seni-pertunjukan','Pertunjukan Seni'],['kreativitas-siswa','Kreativitas Siswa'],['wisuda-siswa','Wisuda Siswa'],['wisuda-guru','Wisuda Madrasah']].map(([file,title],i)=>({id:'gallery-'+i,title,image:'assets/'+file+'.webp',description:''})),
 announcement:[{id:'announcement-main',title:'Informasi Penerimaan Murid Baru Madrasah',description:'Pendaftaran dibuka setiap tahun ajaran baru. Hubungi panitia untuk informasi jadwal dan persyaratan terbaru.'}],
 ppdb:[{id:'ppdb-main',title:'Bergabung bersama MIS Hayatul Islamiyah Cinangka',description:'Penerimaan Murid Baru Madrasah dibuka setiap tahun ajaran baru. Siapkan data calon siswa dan orang tua, lalu isi formulir pendaftaran. Panitia akan menghubungi Anda untuk proses selanjutnya.'}],
 organization:[[['Kepala Yayasan',"Drs. H. Nur'ali"]],[['Komite Madrasah','M. Soleh Noer'],['Kepala Madrasah','Neneng Hasanah, S.Sos.I.']],[['Waka Kurikulum','Rusmiati, S.Pd.I'],['Waka Kesiswaan',"Nur'asiah, S.Pd.I"],['Waka Sarprashum','Maspupah, S.Pd']],[['Bendahara BOS','Yasmin Lyana Lubis, S.Pd'],['Bendahara Harian','Dra. Nurhayati'],['Operator','Azwar Anas, S.Pd.'],['Tata Usaha','Nabila Eka R., S.Kom.']],[['Guru Ekskul',''],['Petugas Kebersihan','']],[['Wali Kelas',''],['Guru Mata Pelajaran','']]]
};

const photo=file=>'assets/'+file;
const placeholder='logo-mi-transparan.png';
const programPhotos=['mushala.jpg','salat-berjamaah.jpg','mushala.jpg','petugas-upacara.jpg','belajar-kreatif.jpg','kegiatan-keagamaan-siswa.jpg','perpustakaan.jpg','hero-classroom.jpg'];
seed.programs.forEach((row,i)=>{row.image=photo(programPhotos[i]);});
seed.extracurriculars=seed.extracurriculars.filter(row=>!['Kaligrafi','Seni Islami'].includes(row.title));
seed.extracurriculars.push(
 {id:'extracurricular-dance',title:'Seni Tari',description:'Pengembangan ekspresi, kreativitas, dan keterampilan gerak.'},
 {id:'extracurricular-taekwondo',title:'Taekwondo',description:'Latihan bela diri untuk membangun kebugaran, kedisiplinan, dan kepercayaan diri.'},
 {id:'extracurricular-traditional-dance',title:'Tari Tradisional',description:'Pengenalan budaya Nusantara melalui gerak dan seni tari tradisional.'}
);
const extraPhotos={'Pramuka':'pramuka-halaman.jpg',"Tahfiz Al-Qur'an":'mushala.jpg','Marawis':'kegiatan-marawis.webp','Pencak Silat':'ekskul-pencak-silat.webp'};
seed.extracurriculars.forEach(row=>{row.image=photo(extraPhotos[row.title]||placeholder);});
seed.facilities=seed.facilities.filter(row=>!['Laboratorium Komputer','Kantin','Ruang Kepala Madrasah','Area Parkir'].includes(row.title));
const facilityPhotos={'Ruang Kelas':'ruang-kelas.jpg','Mushala':'mushala.jpg','Perpustakaan':'perpustakaan.jpg','Lapangan Upacara dan Olahraga':'lapangan-madrasah.jpg','Ruang Guru':'ruang-guru.jpg'};
seed.facilities.forEach(row=>{row.image=photo(facilityPhotos[row.title]||placeholder);});
seed.albums=[
 {id:'album-religious-activities',title:'Kegiatan Keagamaan',description:'Pembiasaan salat berjamaah dan kebersamaan dalam kegiatan keagamaan madrasah.',photos:['salat-berjamaah.jpg','kegiatan-keagamaan-siswa.jpg','kegiatan-keagamaan-halaman.jpg'].map(photo)},
 {id:'album-field-trip-2026',title:'Field Trip 2026',description:'Dokumentasi kebersamaan siswa dan guru dalam kegiatan field trip.',photos:['field-trip-siswa-2026.jpg','field-trip-bersama-guru-2026.jpg'].map(photo)},
 {id:'album-scout-activities',title:'Kegiatan Pramuka',description:'Dokumentasi kegiatan kepramukaan di madrasah.',photos:['pramuka-halaman.jpg','kegiatan-pramuka.webp'].map(photo)},
 {id:'album-teachers',title:'Guru dan Tenaga Pendidik',description:'Kebersamaan keluarga pendidik MIS Hayatul Islamiyah Cinangka.',photos:['guru-madrasah-terbaru.jpg','kebersamaan-guru.jpg'].map(photo)},
 {id:'album-school-environment',title:'Lingkungan dan Fasilitas Madrasah',description:'Ruang belajar dan lingkungan MIS Hayatul Islamiyah Cinangka.',photos:['halaman-madrasah.jpg','lapangan-madrasah.jpg','hero-campus-blue.jpg','lingkungan-madrasah.jpg','hero-campus-front.jpg','perpustakaan.jpg','ruang-guru.jpg','mushala.jpg','ruang-kelas.jpg','ruang-kelas-literasi.jpg'].map(photo)},
 {id:'album-learning-achievements',title:'Pembelajaran dan Prestasi Siswa',description:'Dokumentasi kegiatan belajar, petugas upacara, dan prestasi siswa.',photos:['prestasi-siswa.jpg','petugas-upacara.jpg','hero-classroom.jpg','belajar-kreatif.jpg','kreativitas-siswa.webp','field-trip-edukatif.webp'].map(photo)}
];

seed.organization=seed.organization.flatMap((rows,level)=>rows.map(([description,title],order)=>({id:'organization-'+level+'-'+order,title:title||description,description,image:'assets/organization-placeholder.svg',level,order})));

seed.organization=seed.organization.filter(person=>person.level<5);
seed.teachers=[];

seed.hero=[{id:'hero-main',title:'MIS Hayatul Islamiyah Cinangka',subtitle:'Website Resmi Madrasah',tagline:'Berilmu, beriman, dan berakhlak mulia.',description:'',photos:['assets/hero-campus-blue.jpg','assets/hero-campus-front.jpg','assets/hero-classroom.jpg']}];
