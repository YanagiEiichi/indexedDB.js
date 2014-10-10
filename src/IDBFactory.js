  define("Factory",function(){},{
    open:function(name,version){
      if(typeof name!="string")name+="";
      if(version!==void 0)version*=1;
      if(version<0||version!=version) //Minus or NaN
        throw new Error("Value is not of type 'unsigned long long'.");
      if(version==0)
        throw new Error("The version provided must not be 0.");
      version|=0; //Convert to unsigned long long
      var request=new IDB.OpenDBRequest;
      setTimeout(function(){
        var key=prefix+"-"+stringify(name);
        var oldVersion=localStorage.getItem(key);
        var newVersion=version||oldVersion||1;
        var database=new IDB.Database(name,newVersion);
        request.readyState="done";
        request.result=database;
        if(oldVersion<newVersion){
          database._upgrading=true;
          request.dispatchEvent({type:"upgradeneeded",target:request});
          localStorage.setItem(key,newVersion);
          database._upgrading=false;
        };
        database._commit();
        request.dispatchEvent({type:"success",target:request});
      });
      return request;
    },deleteDatabase:function(name){
      var request=new IDB.OpenDBRequest;
      var key=prefix+"-"+stringify(name);
      var l=localStorage.length,i,partial=[];
      for(i=0;i<l;i++)
        if(localStorage.key(i).slice(0,key.length)==key)
          partial.push(localStorage.key(i));
      for(i=0;i<partial.length;i++)
        localStorage.removeItem(partial[i]);
      setTimeout(function(){request._resolve();});
      return request;
    }
  });
