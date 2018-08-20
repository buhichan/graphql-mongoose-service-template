
if ('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))
    if(!ENV || ENV.SERVICE_WORKER_ON){
        navigator.serviceWorker.register('/sw.js').then(x=>{
            console.log('service worker registered');
            x.update().catch(e=>{
                console.error(e);
            });
        }).catch(e=>{
            console.error(e);
        });
    }else{
        navigator.serviceWorker.getRegistration().then(s=>s&&s.unregister()).catch(e=>{
            console.error(e);
        });
    }
    
export = null