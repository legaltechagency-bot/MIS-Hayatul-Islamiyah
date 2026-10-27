export function youtubeId(value) {
 try {
  const url=new URL(value);
  if(!['https:','http:'].includes(url.protocol))return null;
  const host=url.hostname.toLowerCase();let id;
  if(host==='youtu.be')id=url.pathname.split('/')[1];
  else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com'].includes(host)){
   const parts=url.pathname.split('/').filter(Boolean);
   id=parts[0]==='watch'?url.searchParams.get('v'):['shorts','embed','live'].includes(parts[0])?parts[1]:null;
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null;}
}
