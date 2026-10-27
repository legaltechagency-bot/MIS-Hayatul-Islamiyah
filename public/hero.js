export function renderHero(config){
const hero=document.querySelector('.school-slideshow');
if(hero&&config){
 hero.querySelector('h1').textContent=config.title;
 hero.querySelector('.eyebrow').textContent=config.subtitle||'';
 hero.querySelector('.lead').textContent=config.tagline||'';
 const photos=(config.photos||[]).filter(p=>/^(assets\/|\/assets\/|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(p));
 if(photos.length){const container=hero.querySelector('.hero-slides'),dots=hero.querySelector('.hero-dots');container.replaceChildren();dots.replaceChildren();photos.forEach((src,i)=>{const img=document.createElement('img');img.src=src;img.alt='Foto madrasah '+(i+1);img.className='hero-slide'+(i===0?' is-active':'');img.setAttribute('aria-hidden',String(i!==0));container.append(img);const button=document.createElement('button');button.dataset.slide=String(i);button.setAttribute('aria-label','Tampilkan foto '+(i+1));button.setAttribute('aria-pressed',String(i===0));dots.append(button);});}
}

if(hero){
 const slides=[...hero.querySelectorAll('.hero-slide')],dots=[...hero.querySelectorAll('[data-slide]')],pause=hero.querySelector('.hero-pause');
 let current=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,timer,startX=null;
 const schedule=()=>{clearInterval(timer);if(slides.length>1&&!paused&&!document.hidden)timer=setInterval(()=>show(current+1),6000);};
 const show=(index,manual=false)=>{current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current));dots[i].setAttribute('aria-pressed',String(i===current));});if(manual){hero.querySelector('#hero-slide-status').textContent='Foto '+(current+1)+' dari '+slides.length;schedule();}};
 const updatePause=()=>{pause.innerHTML=paused?'&#9654;':'&#10074;&#10074;';pause.setAttribute('aria-label',paused?'Putar slideshow':'Jeda slideshow');pause.title=pause.getAttribute('aria-label');schedule();};
 hero.querySelector('.hero-prev').onclick=()=>show(current-1,true);
 hero.querySelector('.hero-next').onclick=()=>show(current+1,true);
 dots.forEach((dot,i)=>dot.onclick=()=>show(i,true));
 pause.onclick=()=>{paused=!paused;updatePause();};
 hero.addEventListener('pointerdown',event=>{if(!event.target.closest('a,button'))startX=event.clientX;});
 hero.addEventListener('pointerup',event=>{if(startX!==null&&Math.abs(event.clientX-startX)>45)show(current+(event.clientX<startX?1:-1),true);startX=null;});
 hero.addEventListener('pointercancel',()=>{startX=null;});
 hero.addEventListener('mouseenter',()=>clearInterval(timer));hero.addEventListener('mouseleave',schedule);
 hero.addEventListener('focusin',()=>clearInterval(timer));hero.addEventListener('focusout',schedule);
 document.addEventListener('visibilitychange',schedule);updatePause();
}
}
const syncHeader=()=>document.body.classList.toggle('header-scrolled',window.scrollY>24);
syncHeader();window.addEventListener('scroll',syncHeader,{passive:true});window.addEventListener('pageshow',syncHeader);
