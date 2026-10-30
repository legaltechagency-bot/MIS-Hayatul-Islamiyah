export const siteUrl='https://mishayatulislamiyahcinangka.sch.id';
const descriptions={
 'index.html':'Website resmi MIS Hayatul Islamiyah Cinangka, madrasah ibtidaiyah di Sawangan, Kota Depok. Temukan profil, program pendidikan, kegiatan, dan informasi PMBM.',
 'profil.html':'Kenali sejarah, visi misi, struktur organisasi, serta guru MIS Hayatul Islamiyah Cinangka di Sawangan, Kota Depok.',
 'program-fasilitas.html':'Jelajahi program pendidikan Islam, ekstrakurikuler, dan fasilitas belajar MIS Hayatul Islamiyah Cinangka, Sawangan, Depok.',
 'galeri.html':'Lihat album foto dan video kegiatan belajar, keagamaan, serta aktivitas murid MIS Hayatul Islamiyah Cinangka.',
 'artikel.html':'Berita, artikel, dan informasi kegiatan terbaru MIS Hayatul Islamiyah Cinangka, madrasah ibtidaiyah di Sawangan, Depok.',
 'ppdb.html':'Informasi PMBM (Penerimaan Murid Baru Madrasah) MIS Hayatul Islamiyah Cinangka: alur pendaftaran online dan kontak panitia.',
 'kontak.html':'Hubungi MIS Hayatul Islamiyah Cinangka di Jalan Pendidikan No. 08, Sawangan, Depok. Temukan alamat, WhatsApp, email, dan peta lokasi.',
 'pendaftaran.html':'Formulir pendaftaran murid baru MIS Hayatul Islamiyah Cinangka.',
 'admin.html':'Dashboard pengelolaan konten dan pendaftaran MIS Hayatul Islamiyah Cinangka.',
 'album.html':'Dokumentasi foto kegiatan MIS Hayatul Islamiyah Cinangka.',
 'artikel-detail.html':'Artikel dan kegiatan MIS Hayatul Islamiyah Cinangka.'
};
export const sitemapPages=Object.keys(descriptions).filter(p=>!['admin.html','pendaftaran.html','album.html','artikel-detail.html'].includes(p));
export const canonicalUrl=file=>siteUrl+(file==='index.html'?'/':'/'+file.replace(/\.html$/,''));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function seoHead(file,title){
 const description=descriptions[file],detail=['album.html','artikel-detail.html'].includes(file),privatePage=['admin.html','pendaftaran.html'].includes(file);
 const canonical=canonicalUrl(file),fullTitle=file==='index.html'?'MIS Hayatul Islamiyah Cinangka | Madrasah di Sawangan Depok':title+' | MIS Hayatul Islamiyah Cinangka';
 const school={'@context':'https://schema.org','@type':'School','@id':siteUrl+'/#school',name:'MIS Hayatul Islamiyah Cinangka',url:siteUrl+'/',logo:siteUrl+'/assets/logo-mi-transparan.png',telephone:'+628990257323',email:'mishayatulislamiyahcinangka@gmail.com',address:{'@type':'PostalAddress',streetAddress:'Jalan Pendidikan No. 08 RT.005/003, Kel. Cinangka, Kec. Sawangan',addressLocality:'Kota Depok',addressRegion:'Jawa Barat',addressCountry:'ID'},sameAs:['https://www.instagram.com/mishayatulislamiyah_cinangka/','https://www.youtube.com/@madrasah_hic','https://www.tiktok.com/@madrasah_hic']};
 return '<title>'+esc(fullTitle)+'</title><meta name="description" content="'+esc(description)+'"><meta name="robots" content="'+(privatePage?'noindex, nofollow':'index, follow, max-image-preview:large')+'">'+(!detail?'<link rel="canonical" href="'+canonical+'">':'')+'<meta property="og:type" content="website"><meta property="og:locale" content="id_ID"><meta property="og:site_name" content="MIS Hayatul Islamiyah Cinangka"><meta property="og:title" content="'+esc(fullTitle)+'"><meta property="og:description" content="'+esc(description)+'">'+(!detail?'<meta property="og:url" content="'+canonical+'">':'')+'<meta property="og:image" content="'+siteUrl+'/assets/hero-campus-front.jpg"><meta name="twitter:card" content="summary_large_image">'+(file==='index.html'?'<script type="application/ld+json">'+JSON.stringify(school).replaceAll('<','\\u003c')+'</script>':'');
}
export const sitemap=()=> '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+sitemapPages.map(file=>'<url><loc>'+canonicalUrl(file)+'</loc></url>').join('')+'</urlset>\n';
export const robots=()=> 'User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: '+siteUrl+'/sitemap.xml\n';
