  define("OpenDBRequest",function(){
    this.onupgradeneeded=null;
    this.onblocked=null;
    this.onerror=null;
    this.onsuccess=null;
    this.source=null;
  },new IDB.Request);
