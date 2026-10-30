const CACHE="three-kingdoms-shell-v1";
const SHELL=["/","/manifest.webmanifest"];
self.addEventListener("install",(event:any)=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener("activate",(event:any)=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",(event:any)=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok&&event.request.destination!=="document"){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;})));});
export {};