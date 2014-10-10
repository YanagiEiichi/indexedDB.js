  function NormalizeKeyPath(e){
    if(e instanceof Array)
      for(var i=0;i<e.length;i++)
        AssertKeyPathName(e[i]+="")
    else AssertKeyPathName(e+="");
    return e;
  };
