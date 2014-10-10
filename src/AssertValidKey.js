  function AssertValidKey(key){
    if(key instanceof Array)for(var i=0;i<key.length;i++)
      AssertValidKey(key[i]);
    else if(typeof key!="string"&&typeof key!="number"||key!=key)
      throw new Error("The parameter is not a valid key.");
  };
