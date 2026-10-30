// Detail pages share an HTML shell; keep each published item's canonical distinct.
export function updateDetailSeo(content){
 const articlePage=!!document.querySelector('#article-detail'),albumPage=!!document.querySelector('#album-detail');
 if(!articlePage&&!albumPage)return;
 const id=new URLSearchParams(location.search).get('id');
 const item=(articlePage?content.articles:content.albums)?.find(row=>row.id===id&&(!articlePage||row.status==='published'));
 const meta=(name,value,property=false)=>{const key=property?'property':'name';let node=document.head.querySelector('meta['+key+'="'+name+'"]');if(!node){node=document.createElement('meta');node.setAttribute(key,name);document.head.append(node);}node.content=value;};
 if(!item){meta('robots','noindex, follow');return;}
 const title=item.title+' | MIS Hayatul Islamiyah Cinangka',description=(item.description||item.body||item.title).slice(0,170);
 const url='https://mishayatulislamiyahcinangka.sch.id/'+(articlePage?'artikel-detail':'album')+'?id='+encodeURIComponent(id);
 document.title=title;let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=url;
 meta('description',description);meta('og:title',title,true);meta('og:description',description,true);meta('og:url',url,true);meta('og:type',articlePage?'article':'website',true);
 const image=articlePage?item.image:item.photos?.[0];if(image&&!image.startsWith('data:'))meta('og:image',new URL(image,'https://mishayatulislamiyahcinangka.sch.id/').href,true);
}
